const Client = require("../models/Client");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const axios = require("axios");
const dayjs = require("dayjs");

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("service");

    const formattedAppointments = appointments.map((appointment) => {
      const formattedDate = dayjs(appointment.date).format(
        "MMMM D, YYYY h:mm A"
      );

      return {
        ...appointment.toObject(),
        formattedDate,
      };
    });

    res.json(formattedAppointments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  const {
    client,
    location: { postalCodePrefix, postalCodeSuffix, number, floor },
    serviceId,
    status = "pendente",
    reason,
    ...appointmentData
  } = req.body;

  if (!client || !serviceId || !postalCodePrefix || !postalCodeSuffix) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const postalCodePrefixRegex = /^[0-9]{4}$/;
  const postalCodeSuffixRegex = /^[0-9]{3}$/;

  if (
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
    const existingClient = await Client.findById(client);
    if (!existingClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const response = await axios.get(
      `https://www.cttcodigopostal.pt/api/v1/${apiKey}/${postalCode}`
    );

    const data = response.data[0];
    if (!data) {
      return res
        .status(400)
        .json({ message: "No valid results found for the postal code" });
    }

    const appointment = new Appointment({
      ...appointmentData,
      client,
      service: serviceId,
      status,
      reason,
      location: {
        postalCodePrefix,
        postalCodeSuffix,
        number,
        floor,
        street: data.morada,
        locality: data.localidade,
        parish: data.freguesia,
        county: data.concelho,
        coordinates: {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        },
        localInfo: data["info-local"],
      },
    });

    await appointment.save();

    await Client.findByIdAndUpdate(client, {
      $push: { appointments: appointment._id },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error.message);
    res
      .status(500)
      .json({ message: "Error creating appointment", error: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const appointment = await Appointment.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await Client.findByIdAndUpdate(appointment.client, {
      $pull: { appointments: id },
    });

    res.json({ message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
