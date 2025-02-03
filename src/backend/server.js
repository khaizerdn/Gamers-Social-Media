const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer"); // Import nodemailer
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser'); // Add this

dotenv.config();

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',  // Your frontend URL
    credentials: true,                // Allow cookies and credentials
  })
);
app.use(express.json());

// Middleware
app.use(bodyParser.json());
app.use(cookieParser()); // Middleware to parse cookies

const authenticateToken = (req, res, next) => {
  // Check if the token is in the Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  // If no token in header, check cookies for the access token
  if (!token) {
    const cookieToken = req.cookies.accessToken;
    if (!cookieToken) return res.status(401).json({ message: "Access token required" });
    req.token = cookieToken; // Manually set token from cookie
  }

  // Verify token and proceed
  jwt.verify(token || req.token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid access token" });
    req.user = user;
    next();
  });
};



// Load environment variables from .env file


const tempUserData = {};

// Create MySQL connection pool for better scalability
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gamers",
});

// Function to handle common database queries with error handling
const dbQuery = (query, values) => {
  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if (error) {
        console.error("Database query error:", error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// Function to generate a random verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
};

// Function to send verification email
const sendVerificationEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Add your email here
      pass: process.env.EMAIL_PASS, // Add your email password here
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  };

  return transporter.sendMail(mailOptions);
};

// POST route to create an account
// Snowflake ID Generator Function
class SnowflakeID {
  constructor(machineId = 1) {
    this.machineId = machineId; // Machine ID (unique per server)
    this.sequence = 0; // Sequence number
    this.lastTimestamp = -1; // Last generated timestamp

    // Constants for Snowflake components
    this.TWEPOCH = 1288834974657n; // Custom epoch (when system started)
    this.MACHINE_ID_BITS = 10; // Machine ID bits (can be up to 1024 machines)
    this.SEQUENCE_BITS = 12; // Sequence bits (4096 IDs per millisecond)
    this.MAX_SEQUENCE = -1 ^ (-1 << this.SEQUENCE_BITS); // 4095
    this.MACHINE_ID_SHIFT = this.SEQUENCE_BITS; // Shift for machine ID
    this.TIMESTAMP_SHIFT = this.SEQUENCE_BITS + this.MACHINE_ID_BITS; // Shift for timestamp

    this.sequenceMask = this.MAX_SEQUENCE; // Mask for sequence part
  }

  // Generate a unique Snowflake ID
  generate() {
    let timestamp = this.currentTimestamp();

    if (timestamp === this.lastTimestamp) {
      // Same millisecond: increment the sequence number
      this.sequence = (this.sequence + 1) & this.sequenceMask;
      if (this.sequence === 0) {
        // If sequence overflows, wait for next millisecond
        while (timestamp <= this.lastTimestamp) {
          timestamp = this.currentTimestamp();
        }
      }
    } else {
      // New millisecond: reset sequence number
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    // Shift and combine parts into a 64-bit number
    const id = ((BigInt(timestamp) - this.TWEPOCH) << BigInt(this.TIMESTAMP_SHIFT)) |
               (BigInt(this.machineId) << BigInt(this.MACHINE_ID_SHIFT)) |
               BigInt(this.sequence);
    
    return id;
  }

  // Get current timestamp in milliseconds
  currentTimestamp() {
    return BigInt(new Date().getTime());
  }
}

// Instantiate Snowflake generator with a machine ID (you can change this if needed)
const snowflake = new SnowflakeID(1);

// Express.js route for account creation
app.post("/createaccount", async (req, res) => {
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








app.post("/check-availability", async (req, res) => {
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



app.post("/verify-account", async (req, res) => {
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



app.post("/resend-code", async (req, res) => {
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





// POST route for user login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    const userResults = await dbQuery(sql, [email]);

    if (userResults.length > 0) {
      const user = userResults[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Generate access token with minimal information (no user ID)
        const accessToken = jwt.sign(
          {}, // Empty payload, focusing on session/permissions
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );

        // Generate refresh token with the user ID
        const refreshToken = jwt.sign(
          { id: user.id }, // Store the user ID in the refresh token
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" }
        );

        // Store refresh token in DB (for token refresh process)
        await dbQuery("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id]);

        // Set cookies for both access and refresh tokens
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // For production environments
          sameSite: "Strict",
          maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // For production environments
          sameSite: "Strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Set userId cookie based on the user ID in the refreshToken
        const decodedRefreshToken = jwt.decode(refreshToken); // Decode the refresh token to extract user ID
        res.cookie("userId", decodedRefreshToken.id, {
          httpOnly: false, // Optional: Set to false if you need to access this client-side
          secure: process.env.NODE_ENV === "production", // For production environments
          sameSite: "Strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // Same lifespan as refresh token
        });

        return res.status(200).json({ message: "Login successful" });
      }
    }

    return res.status(401).json("Incorrect email or password.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Middleware to sync userId and refresh token expiration time
app.use(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  // Check if refreshToken exists
  if (refreshToken) {
    try {
      // Decode the refresh token to get userId and expiration time
      const decoded = jwt.decode(refreshToken);

      if (decoded && decoded.id && decoded.exp) {
        // Calculate the refresh token's remaining time (in ms)
        const expiresIn = decoded.exp * 1000 - Date.now(); // Convert exp to milliseconds and subtract current time

        // If userId in cookie doesn't match the decoded userId or the cookie is expired, update it
        if (req.cookies.userId !== decoded.id) {
          // Sync the userId cookie to match the refresh token's expiration
          res.cookie("userId", decoded.id, {
            httpOnly: false, // Optional: Set to false if client-side access needed
            secure: process.env.NODE_ENV === "production", // Secure in production
            sameSite: "Strict",
            maxAge: expiresIn, // Set lifespan to the remaining time of the refresh token
          });
        }
      }
    } catch (error) {
      console.error("Error decoding refreshToken:", error);
    }
  }

  next(); // Proceed to next middleware or route handler
});




app.post("/logout", (req, res) => {
  try {
    // Clear both the accessToken and refreshToken cookies
    res.clearCookie("accessToken", { 
      path: "/", 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Strict" 
    });
    res.clearCookie("refreshToken", { 
      path: "/", 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Strict" 
    });
    res.clearCookie("userId", { 
      path: "/", 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Strict" 
    });

    // Directly remove the refresh token from the database
    dbQuery("UPDATE users SET refresh_token = NULL WHERE refresh_token IS NOT NULL")
      .then(() => {
        // Return success response
        res.status(200).json({ message: "Logged out successfully" });
      })
      .catch((error) => {
        console.error("Error invalidating refresh token:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




app.post("/token", async (req, res) => {
  const { refreshToken } = req.cookies; // Get refresh token from cookies

  if (!refreshToken) return res.status(403).json({ message: "Refresh token required" });

  try {
    // Decode and verify the refresh token
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Validate refresh token from DB
    const result = await dbQuery("SELECT * FROM users WHERE id = ? AND refresh_token = ?", [user.id, refreshToken]);
    if (result.length === 0) return res.status(403).json({ message: "Invalid refresh token" });

    // Generate new tokens
    const newAccessToken = jwt.sign(
      {},
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Update refresh token in DB
    await dbQuery("UPDATE users SET refresh_token = ? WHERE id = ?", [newRefreshToken, user.id]);

    // Set new cookies with updated tokens
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set userId cookie based on the refresh token (user.id)
    res.cookie("userId", user.id, {
      httpOnly: false, // Set to false to access this on the client side if needed
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // Same lifespan as refresh token
    });

    res.status(200).json({ message: "Tokens refreshed" });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
});



// For testing retrieving protected data / authenticateToken
app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).send("Protected content");
});

// This is the backend code to verify the refresh token

app.post('/verify-refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return ; //res.status(401).send("No refresh token found")
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // If valid, you can optionally generate a new access token or just return success
    return res.status(200).send("Valid refresh token");
  } catch (error) {
    return res.status(403).send("Invalid or expired refresh token");
  }
});



app.post("/check-email", async (req, res) => {
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



app.post("/fp-verifycode", async (req, res) => {
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




app.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required.' });
  }

  try {
    // Generate salt and hash the password
    const saltRounds = 10; // Adjust rounds as needed for security vs. performance
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the password in the database
    const query = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(query, [hashedPassword, email], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Database error.' });
      }

      if (result.affectedRows > 0) {
        return res.status(200).json({ success: true, message: 'Password reset successfully.' });
      } else {
        return res.status(400).json({ success: false, error: 'Email not found.' });
      }
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, error: 'Error resetting password.' });
  }
});

app.get("/user", authenticateToken, async (req, res) => {
  const userId = req.user.id; 

  try {
    // Query to retrieve the user's information based on the user ID
    const query = "SELECT id, first_name, last_name, username, email, birthdate, gender FROM users WHERE id = ?";
    const [user] = await dbQuery(query, [userId]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user's details as response
    res.status(200).json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      email: user.email,
      birthdate: user.birthdate,
      gender: user.gender,
    });

  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

app.get("/user-details", async (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const sql = "SELECT first_name, last_name, username FROM users WHERE id = ?";
    const userResults = await dbQuery(sql, [userId]);

    if (userResults.length > 0) {
      return res.status(200).json(userResults[0]);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Start the server
const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
