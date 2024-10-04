const User = require("../models/User.model");
const axios = require("axios");

const POSTAL_CODE_API_KEY = process.env.POSTAL_CODE_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PRICE_PER_KM = parseFloat(process.env.PRICE_PER_KM);
const BASE_FEE = parseFloat(process.env.BASE_FEE);
const START_LATITUDE = parseFloat(process.env.START_LATITUDE);
const START_LONGITUDE = parseFloat(process.env.START_LONGITUDE);

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

const calculateTravelCost = async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const startCoordinates = `${process.env.START_LATITUDE},${process.env.START_LONGITUDE}`;
    const endCoordinates = `${latitude},${longitude}`;
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${startCoordinates}&destinations=${endCoordinates}&key=${mapsApiKey}`;

    const googleResponse = await axios.get(googleMapsApiUrl);
    const distanceData = googleResponse.data.rows[0].elements[0];

    if (!distanceData || distanceData.status !== "OK") {
      throw new Error("Failed to get distance data");
    }

    const distance = (distanceData.distance.value / 1000).toFixed(2);
    const pricePerKm = parseFloat(process.env.PRICE_PER_KM);
    const baseFee = parseFloat(process.env.BASE_FEE);
    const feeCalculated = (distance * pricePerKm + baseFee).toFixed(2);

    res.status(200).json({ cost: feeCalculated });
  } catch (error) {
    res.status(500).json({ message: "Error calculating travel cost", error });
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
      morada: data.morada,
      localidade: data.localidade,
      freguesia: data.freguesia,
      concelho: data.concelho,
      latitude: data.latitude, // Adicionando latitude
      longitude: data.longitude, // Adicionando longitude
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
  calculateTravelCost,
};
