const express = require("express");
const {
  addToCart,
  removeFromCart,
  viewCart,
  editCart,
} = require("../controllers/cartController");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addToCart);
router.delete("/", authMiddleware, removeFromCart);
router.get("/", authMiddleware, viewCart);
router.put("/edit", authMiddleware, editCart);

module.exports = router;
