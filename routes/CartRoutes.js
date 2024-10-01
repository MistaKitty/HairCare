const express = require("express");
const {
  addToCart,
  removeFromCart,
  viewCart,
} = require("../controllers/cartController");

const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const router = express.Router();

const roleGuard = authorizeRoles("admin", "worker", "client");
router.post("/add", authMiddleware, roleGuard, addToCart);
router.delete("/remove", authMiddleware, roleGuard, removeFromCart);
router.get("/", authMiddleware, roleGuard, viewCart);

module.exports = router;
