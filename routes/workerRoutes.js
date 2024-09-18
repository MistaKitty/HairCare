const express = require("express");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "worker"),
  (req, res) => {
    res.json({
      message: "Access authorized for administrators and workers.",
    });
  }
);

module.exports = router;
