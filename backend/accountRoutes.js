const express = require("express");
const router = express.Router();
const { dbQuery } = require("./db");
const bcrypt = require("bcrypt");
const { generateVerificationCode, sendVerificationEmail } = require("./emailService");
const SnowflakeID = require("./snowflake");
const snowflake = new SnowflakeID(1);

router.post("/createaccount", async (req, res) => {
  const { firstName, lastName, username, email, password, gender, month, day, year } = req.body;

  try {
    // Step 1: Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 2: Create the birthdate
    const birthdate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Step 3: Generate a verification code and set an expiration time (e.g., 15 minutes from now)
    const verificationCode = generateVerificationCode();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
    const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Step 4: Generate a Snowflake ID for the user
    const userId = snowflake.generate().toString();

    // Step 5: Check if the email or username already exists with is_verified = 0
    const checkUserQuery = "SELECT id, is_verified FROM users WHERE (email = ? OR username = ?) AND is_verified = 0";
    const checkUserValues = [email, username];
    const existingUser = await dbQuery(checkUserQuery, checkUserValues);

    if (existingUser.length > 0) {
      // If the user exists and is unverified, update the existing record
      const userId = existingUser[0].id;
      const updateUserQuery = `
        UPDATE users SET 
          first_name = ?, 
          last_name = ?, 
          username = ?, 
          email = ?, 
          password = ?, 
          birthdate = ?, 
          gender = ?, 
          verification_code = ?, 
          expiration_time = ?, 
          created_at = NOW()
        WHERE id = ? AND is_verified = 0`;

      await dbQuery(updateUserQuery, [
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        birthdate,
        gender,
        hashedVerificationCode,
        expirationTime, // Store the expiration time
        userId,
      ]);

      // Step 6: Send the verification email (if updating)
      await sendVerificationEmail(email, verificationCode);

      console.log(`Existing unverified account updated and verification email sent to: ${email}`);
      res.status(200).json({
        success: true,
        message: "Account updated. Verification email sent. Please check your inbox.",
      });

    } else {
      // Step 7: If no existing unverified account, create a new one with the unique Snowflake ID
      const insertUserQuery = `
        INSERT INTO users (id, first_name, last_name, username, email, password, birthdate, gender, is_verified, verification_code, expiration_time, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NOW())`;

      await dbQuery(insertUserQuery, [
        userId,  // Snowflake ID
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        birthdate,
        gender,
        hashedVerificationCode,
        expirationTime, // Store the expiration time
      ]);

      // Step 8: Send the verification email
      await sendVerificationEmail(email, verificationCode);

      console.log(`New account created with ID ${userId} and verification email sent to: ${email}`);
      res.status(200).json({
        success: true,
        message: "Account created. Verification email sent. Please check your inbox.",
      });
    }

  } catch (error) {
    console.error("Error during account creation:", error);
    res.status(500).send("Error creating account. Please try again.");
  }
});

router.post("/check-availability", async (req, res) => {
  const { username, email } = req.body;

  try {
    // Query to check if the username or email exists and is verified
    const userCheckQuery = `
      SELECT username, email, is_verified 
      FROM users 
      WHERE (username = ? OR email = ?)
    `;
    const userCheckValues = [username, email];

    console.time("Username and Email Check");
    const existingUsers = await dbQuery(userCheckQuery, userCheckValues);
    console.timeEnd("Username and Email Check");

    // Prepare an errors object to store potential error messages
    const errors = {};

    // Check if username exists and is verified
    if (
      existingUsers.some(
        (user) => user.username === username && user.is_verified === 1
      )
    ) {
      errors.username = "Username is already taken.";
    }

    // Check if email exists and is verified
    if (
      existingUsers.some(
        (user) => user.email === email && user.is_verified === 1
      )
    ) {
      errors.email = "Email is already taken.";
    }

    // If there are any errors, return them to the client
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // If no errors, send a success response
    res.status(200).send("Username and email are available.");
  } catch (error) {
    console.error("Error checking username and email:", error);
    res.status(500).send("Error checking username and email");
  }
});

router.post("/verify-account", async (req, res) => {
  const { email, verificationCode } = req.body;
  
    try {
      // Fetch the user by email and check if the code exists and has not expired
      const query = "SELECT verification_code, expiration_time FROM users WHERE email = ? AND is_verified = 0";
      const user = await dbQuery(query, [email]);
  
      if (!user.length) {
        return res.status(400).json({
          success: false,
          message: "User not found or already verified.",
        });
      }
  
      const storedVerificationCode = user[0].verification_code;
      const expirationTime = new Date(user[0].expiration_time);
      const currentTime = new Date();
  
      // Check if the code is correct and hasn't expired
      const isCodeValid = await bcrypt.compare(verificationCode, storedVerificationCode);
  
      if (!isCodeValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code.",
        });
      }
  
      if (currentTime > expirationTime) {
        return res.status(400).json({
          success: false,
          message: "Verification code has expired. Please request a new one.",
        });
      }
  
      // If the code is valid and hasn't expired, proceed to verify the user
      const updateVerificationQuery = `
        UPDATE users 
        SET is_verified = 1 
        WHERE email = ? AND is_verified = 0`;
  
      await dbQuery(updateVerificationQuery, [email]);
  
      res.status(200).json({
        success: true,
        message: "User successfully verified!",
      });
  
    } catch (error) {
      console.error("Error verifying the code:", error);
      res.status(500).send("Error verifying the code. Please try again.");
    }
});

router.post("/resend-code", async (req, res) => {
  const { email } = req.body;  // Retrieve email from the request body
  
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not provided. Please try again.",
      });
    }
  
    try {
      // Step 1: Generate a new verification code and set an expiration time (e.g., 15 minutes from now)
      const verificationCode = generateVerificationCode();
      const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
      const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration
  
      // Step 2: Update the verification code and expiration time in the database
      const updateVerificationCodeQuery = `
        UPDATE users 
        SET verification_code = ?, expiration_time = ? 
        WHERE email = ? AND is_verified = 0`;
  
      await dbQuery(updateVerificationCodeQuery, [hashedVerificationCode, expirationTime, email]);
  
      // Step 3: Send the new verification code email
      await sendVerificationEmail(email, verificationCode);
  
      console.log(`Verification email resent to: ${email}`);
      res.status(200).json({
        success: true,
        message: "Verification email resent. Please check your inbox.",
      });
  
    } catch (error) {
      console.error("Error while resending verification code:", error);
      res.status(500).send("Error resending verification code. Please try again.");
    }
});

module.exports = router;