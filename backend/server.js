const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { syncUserId } = require("./syncUserId");

// Import routes
const accountRoutes = require("./accountRoutes");
const authRoutes = require("./authRoutes");
const passwordResetRoutes = require("./passwordResetRoutes");
const userRoutes = require("./userRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(syncUserId);

// Routes
app.use("/", accountRoutes);
app.use("/", authRoutes);
app.use("/", passwordResetRoutes);
app.use("/", userRoutes);

const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Server running on port ${port}`));