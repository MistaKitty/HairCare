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
  const { hairLength, ...serviceData } = req.body;

  console.log("Request Body:", req.body);

  if (!["Short", "Medium", "Long", "Extra Long"].includes(hairLength)) {
    return res.status(400).json({
      message:
        "Invalid hair length. Must be one of: Short, Medium, Long, Extra Long",
    });
  }

  try {
    const service = new Service({
      ...serviceData,
      hairLength,
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error.message);
    res
      .status(400)
      .json({ message: "Error creating service", error: error.message });
  }
};

exports.updateService = async (req, res) => {
  const { hairLength, ...updateData } = req.body;

  if (
    hairLength &&
    !["Short", "Medium", "Long", "Extra Long"].includes(hairLength)
  ) {
    return res.status(400).json({
      message:
        "Invalid hair length. Must be one of: Short, Medium, Long, Extra Long",
    });
  }

  try {
    const service = await Service.findByIdAndUpdate(req.params.id, updateData, {
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
