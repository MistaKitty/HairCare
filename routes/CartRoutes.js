const express = require("express");
const {
  addToCart,
  removeFromCart,
  viewCart,
  editCart,
  calculateShippingCost,
  getLocationAndFee,
} = require("../controllers/cartController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addToCart);
router.delete("/", authMiddleware, removeFromCart);
router.get("/", authMiddleware, viewCart);
router.put("/edit", authMiddleware, editCart);
router.post("/shipping", authMiddleware, calculateShippingCost);
router.post("/localidade", authMiddleware, getLocationAndFee);

module.exports = router;
