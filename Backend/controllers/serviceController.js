require("dotenv").config();
const axios = require("axios");
const Service = require("../models/Service");

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    console.log("Services:", services);
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.createService = async (req, res) => {
  const {
    location: { postalCodePrefix, postalCodeSuffix, number, floor },
    ...serviceData
  } = req.body;

  console.log("Request Body:", req.body);

  const postalCodePrefixRegex = /^[0-9]{4}$/;
  const postalCodeSuffixRegex = /^[0-9]{3}$/;

  if (
    !postalCodePrefix ||
    !postalCodeSuffix ||
    !postalCodePrefixRegex.test(postalCodePrefix) ||
    !postalCodeSuffixRegex.test(postalCodeSuffix)
  ) {
    return res.status(400).json({
      message:
        "Invalid postal code format. Expected format is 0000 for prefix and 000 for suffix",
    });
  }

  const postalCode = `${postalCodePrefix}-${postalCodeSuffix}`;
  console.log(postalCode);

  const apiKey = process.env.POSTAL_CODE_API_KEY;

  try {
    const response = await axios.get(
      `https://www.cttcodigopostal.pt/api/v1/${apiKey}/${postalCode}`
    );

    console.log("API Response:", response.data);

    const data = response.data[0];

    if (!data) {
      return res
        .status(400)
        .json({ message: "No valid results found for the postal code" });
    }

    const county = data.concelho;
    const locality = data.localidade;
    const parish = data.freguesia;
    const postalDesignation = data["codigo-postal"];
    const street = data.morada;
    const local = data["info-local"];
    const coordinates = [data.latitude, data.longitude];
    console.log(coordinates);

    const service = new Service({
      ...serviceData,
      location: {
        postalCodePrefix,
        postalCodeSuffix,
        coordinates,
        number,
        floor,
        county,
        locality,
        parish,
        postalDesignation,
        street,
        local,
      },
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error.message); // Adicione um log de erro para depuração
    res
      .status(400)
      .json({ message: "Error creating service", error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: "Bad Request", error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(400).json({ message: "Bad Request", error: error.message });
  }
};
