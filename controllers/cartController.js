const User = require("../models/User.model");
const axios = require("axios");

const PRICE_PER_KM = 1.5;
const BASE_FEE = 2.5;
const START_LATITUDE = 38.7127235;
const START_LONGITUDE = -9.4157982;
const POSTAL_CODE_API_KEY = process.env.POSTAL_CODE_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

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

const editCart = async (req, res) => {
  const { serviceId, quantity } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    const existingItem = user.cart.find(
      (item) => item.serviceId.toString() === serviceId
    );

    if (existingItem) {
      existingItem.quantity = quantity;
      await user.save();
      return res.status(200).json(user.cart);
    } else {
      return res.status(404).json({ message: "Item not found in cart." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error editing item in cart", error });
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

const calculateShippingCost = async (req, res) => {
  const { weight, address } = req.body;

  try {
    const response = await axios.post(
      "API_URL_DOS_CTT",
      {
        weight,
        address,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CTT_API_KEY}`,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Erro ao chamar a API dos CTT:", error);
    res
      .status(500)
      .json({ message: "Erro ao calcular o custo de envio", error });
  }
};

const getLocationDetailsFromPostalCode = async (req, res) => {
  const { postalCodePrefix, postalCodeSuffix } = req.body;
  const postalCode = `${postalCodePrefix}-${postalCodeSuffix}`;

  try {
    const response = await axios.get(
      `https://www.cttcodigopostal.pt/api/v1/${POSTAL_CODE_API_KEY}/${postalCode}`
    );

    const data = response.data[0];
    if (!data) {
      return res
        .status(400)
        .json({ message: "No valid results found for the postal code" });
    }

    const locationDetails = {
      concelho: data.concelho,
      freguesia: data.freguesia,
      infoLocal: data.info_local, // Alterado para incluir apenas o info_local
    };

    return res.status(200).json(locationDetails);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching location details" });
  }
};

module.exports = { getLocationDetailsFromPostalCode };

module.exports = {
  addToCart,
  removeFromCart,
  editCart,
  viewCart,
  calculateShippingCost,
  getLocationDetailsFromPostalCode,
};
