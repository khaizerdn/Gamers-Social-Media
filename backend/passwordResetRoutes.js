const express = require("express");
const router = express.Router();
const { dbQuery } = require("./db"); // Import dbQuery instead of db
const bcrypt = require("bcrypt");
const { generateVerificationCode, sendVerificationEmail } = require("./emailService");

// Check email endpoint
router.post("/check-email", async (req, res) => {
  const { email } = req.body;

  try {
    // Step 1: Check if the email exists in the database
    const emailCheckQuery = "SELECT id, is_verified FROM users WHERE email = ?";
    const [result] = await dbQuery(emailCheckQuery, [email]);

    if (!result || result.length === 0) {
      return res.status(400).json({ error: "This email is not registered." });
    }

    // Respond to the client immediately if user exists
    res.status(200).json({ success: true, message: "Verification process started." });

    // Step 2: Generate and hash the verification code, set expiration time
    const verificationCode = generateVerificationCode();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
    const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

    // Step 3: Update the user's verification code and expiration time in the database
    const updateVerificationCodeQuery = `
      UPDATE users 
      SET verification_code = ?, expiration_time = ? 
      WHERE email = ?`;

    await dbQuery(updateVerificationCodeQuery, [hashedVerificationCode, expirationTime, email]);

    // Step 4: Send the verification email asynchronously
    await sendVerificationEmail(email, verificationCode);
    console.log(`Verification email sent to: ${email}`);
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).send("Error checking email.");
  }
});

// Verify code endpoint
router.post("/fp-verifycode", async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Step 1: Retrieve the hashed verification code and expiration time from the database
    const getVerificationCodeQuery = `
      SELECT verification_code, expiration_time 
      FROM users 
      WHERE email = ?`;

    const result = await dbQuery(getVerificationCodeQuery, [email]);

    // Step 2: Handle cases where no user is found
    if (!result || result.length === 0) {
      return res.status(400).send("No verification code found for this email.");
    }

    const { verification_code: storedCode, expiration_time: expirationTime } = result[0];
    const currentTime = new Date();

    // Step 3: Check if the verification code is correct
    const isCodeValid = await bcrypt.compare(verificationCode, storedCode);

    if (!isCodeValid) {
      return res.status(400).send("The verification code is incorrect.");
    }

    // Step 4: Check if the verification code has expired
    if (currentTime > new Date(expirationTime)) {
      return res.status(400).send("The verification code has expired. Please request a new one.");
    }

    // Step 5: If everything is valid, respond successfully
    res.status(200).json({ success: true, message: "Code verified successfully." });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).send("Error verifying the code.");
  }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, error: "Password is required." });
  }

  try {
    // Generate salt and hash the password
    const saltRounds = 10; // Adjust rounds as needed for security vs. performance
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the password in the database using dbQuery
    const query = "UPDATE users SET password = ? WHERE email = ?";
    const result = await dbQuery(query, [hashedPassword, email]);

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "Password reset successfully." });
    } else {
      return res.status(400).json({ success: false, error: "Email not found." });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, error: "Error resetting password." });
  }
});

module.exports = router;