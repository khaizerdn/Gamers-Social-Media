const jwt = require("jsonwebtoken");

const syncUserId = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return next();

  try {
    const decoded = jwt.decode(refreshToken);
    if (decoded?.id && decoded.exp && req.cookies.userId !== decoded.id) {
      res.cookie("userId", decoded.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: decoded.exp * 1000 - Date.now(),
      });
    }
  } catch (error) {
    console.error("Error syncing user ID:", error);
  }
  next();
};

module.exports = { syncUserId };