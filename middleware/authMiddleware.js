const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

let invalidTokens = [];

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    if (invalidTokens.includes(token)) {
      return res.status(401).json({ message: "Token is invalid" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

const logout = (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    invalidTokens.push(token);
  }
  res.json({ message: "Logged out successfully" });
};

module.exports = { authMiddleware, authorizeRoles, logout };
