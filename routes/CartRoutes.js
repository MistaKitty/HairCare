const express = require("express");
const {
  addToCart,
  removeFromCart,
  viewCart,
} = require("../controllers/cartController");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addToCart);
router.delete("/", authMiddleware, removeFromCart);
router.get("/", authMiddleware, viewCart);

module.exports = router;
