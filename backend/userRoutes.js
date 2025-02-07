const express = require("express");
const router = express.Router();
const { dbQuery } = require("./db");
const { authenticateToken } = require("./authMiddleware");

router.get("/user", authenticateToken, async (req, res) => {
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

router.get("/user-details", authenticateToken, async (req, res) => {
  const userId = req.cookies.userId;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const sql = "SELECT id, first_name, last_name, username, email, birthdate, gender, created_at FROM users WHERE id = ?";
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

module.exports = router;