const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let invalidTokens = [];

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const userEmail = email.toLowerCase();
    const user = await User.findOne({ email: userEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.logout = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  invalidTokens.push(token);
  res.json({ message: "Logged out successfully" });
};

exports.verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (invalidTokens.includes(token)) {
    return res.status(401).json({ message: "Token is invalid" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Unauthorized - Token expired or invalid" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== decoded.role) {
      invalidTokens.push(token);
      return res
        .status(403)
        .json({ message: "User role has changed - Please log in again" });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

exports.updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = newRole;
    await user.save();

    invalidTokens = invalidTokens.filter((token) => {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      return decodedToken.id !== userId;
    });

    res.json({ message: "User role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
