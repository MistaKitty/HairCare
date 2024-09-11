require("dotenv").config();
const axios = require("axios");
const Service = require("../models/Service");

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.createService = async (req, res) => {
  const { postalCodePrefix, postalCodeSuffix, number, floor, ...serviceData } =
    req.body;

  console.log(req.body);

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

  const apiKey = process.env.POSTAL_CODE_API_KEY;

  try {
    const response = await axios.get(
      `https://www.cttcodigopostal.pt/api/v1/${apiKey}/${postalCode}`
    );

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
    const coordinates = [parseFloat(data.latitude), parseFloat(data.longitude)];

    const service = new Service({
      ...serviceData,
      location: {
        postalCodePrefix,
        postalCodeSuffix,
        number,
        floor,
        county,
        locality,
        parish,
        postalDesignation,
        street,
        local,
        coordinates,
      },
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
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
