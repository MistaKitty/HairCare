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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

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

exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (invalidTokens.includes(token)) {
    console.log("Invalid token attempted:", token);
    return res.status(401).json({ message: "Token is invalid" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res
        .status(401)
        .json({ message: "Unauthorized - Token expired or invalid" });
    }
    req.userId = decoded.id;
    next();
  });
};
