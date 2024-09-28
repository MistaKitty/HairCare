const express = require("express");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Access authorized for administrators." });
});

module.exports = router;

//
