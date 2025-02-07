const express = require("express");
const router = express.Router();
const { dbQuery } = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./authMiddleware");

router.post("/login", async (req, res) => {
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

router.post("/logout", (req, res) => {
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

router.post("/token", async (req, res) => {
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

router.post("/verify-refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return; //res.status(401).send("No refresh token found")
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // If valid, you can optionally generate a new access token or just return success
    return res.status(200).send("Valid refresh token");
  } catch (error) {
    return res.status(403).send("Invalid or expired refresh token");
  }
});

module.exports = router;