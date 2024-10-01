const User = require("../models/User.model");

const addToCart = async (req, res) => {
  const { serviceId, quantity } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const existingItem = user.cart.find(
      (item) => item.serviceId.toString() === serviceId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ serviceId, quantity });
    }

    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart", error });
  }
};

const removeFromCart = async (req, res) => {
  const { serviceId } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    user.cart = user.cart.filter(
      (item) => item.serviceId.toString() !== serviceId
    );

    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cart", error });
  }
};

const viewCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate("cart.serviceId");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Error viewing cart", error });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  viewCart,
};
