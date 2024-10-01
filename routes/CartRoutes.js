const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.post("/cart/add", async (req, res) => {
  const { userId, serviceId, quantity } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

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
    res
      .status(500)
      .json({ message: "Erro ao adicionar item ao carrinho", error });
  }
});

router.delete("/cart/remove", async (req, res) => {
  const { userId, serviceId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    user.cart = user.cart.filter(
      (item) => item.serviceId.toString() !== serviceId
    );

    await user.save();
    res.status(200).json(user.cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao remover item do carrinho", error });
  }
});

router.get("/cart/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("cart.serviceId");
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Erro ao visualizar carrinho", error });
  }
});

module.exports = router;
