const User = require("../models/User.model");
const Appointment = require("../models/Appointment.model");
const Service = require("../models/Service.model");
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
    location,
    services,
    date,
    description,
    fee,
    total,
    travelDuration,
    distance,
    servicePrice,
    serviceDuration,
  } = req.body;

  if (!location || !services || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const { postalCodePrefix, postalCodeSuffix, number, floor } = location;
  const user = req.user._id;

  if (!postalCodePrefix || !postalCodeSuffix) {
    return res.status(400).json({ message: "Missing postal code information" });
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
    const servicesData = await Service.find({ _id: { $in: services } });
    if (!servicesData || servicesData.length === 0) {
      return res.status(404).json({ message: "No services found" });
    }

    const totalServiceDuration = servicesData.reduce(
      (acc, service) => acc + service.duration,
      0
    );

    const response = await axios.get(
      `https://www.cttcodigopostal.pt/api/v1/${apiKey}/${postalCode}`
    );

    const data = response.data[0];
    if (!data) {
      return res
        .status(400)
        .json({ message: "No valid results found for the postal code" });
    }

    const coordinates = {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    };

    const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${process.env.START_LATITUDE},${process.env.START_LONGITUDE}&destinations=${coordinates.latitude},${coordinates.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const googleResponse = await axios.get(googleMapsApiUrl);
    const distanceData = googleResponse.data.rows[0].elements[0];

    if (!distanceData || distanceData.status !== "OK") {
      throw new Error("Failed to get distance data");
    }

    const distance = (distanceData.distance.value / 1000).toFixed(2);
    const travelDurationSeconds = distanceData.duration.value;
    const hours = Math.floor(travelDurationSeconds / 3600);
    const minutes = Math.floor((travelDurationSeconds % 3600) / 60);
    const travelDurationFormatted = `${hours}h${String(minutes).padStart(
      2,
      "0"
    )}`;

    const pricePerKm = parseFloat(process.env.PRICE_PER_KM);
    const baseFee = parseFloat(process.env.BASE_FEE);
    const feeCalculated = (distance * pricePerKm + baseFee).toFixed(2);

    const serviceHours = Math.floor(totalServiceDuration / 3600);
    const serviceMinutes = Math.floor((totalServiceDuration % 3600) / 60);
    const serviceDurationFormatted = `${serviceHours}h${String(
      serviceMinutes
    ).padStart(2, "0")}`;

    const appointment = new Appointment({
      user,
      appointment: {
        services: servicesData.map((service) => ({
          serviceId: service._id,
          serviceName: service.treatments,
          duration: Math.floor(service.duration / 60),
        })),
        date,
        status: "pending",
        location: {
          postalCodePrefix,
          postalCodeSuffix,
          number,
          floor,
          street: data.morada,
          locality: data.localidade,
          parish: data.freguesia,
          county: data.concelho,
          coordinates,
          localInfo: data["info-local"],
        },
        description,
      },
      billing: {
        fee: `€${feeCalculated}`,
        total: `€${(
          parseFloat(feeCalculated) +
          servicesData.reduce((acc, service) => acc + service.price, 0)
        ).toFixed(2)}`,
        servicePrice: `€${servicesData
          .reduce((acc, service) => acc + service.price, 0)
          .toFixed(2)}`,
        serviceDuration: serviceDurationFormatted,
      },
      travel: {
        travelDuration: travelDurationFormatted,
        distance: `${distance} km`,
      },
    });

    await appointment.save();
    await User.findByIdAndUpdate(user, {
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

    if (
      updates.status &&
      !["pending", "canceled", "rescheduled", "confirmed"].includes(
        updates.status
      )
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }

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

    await User.findByIdAndUpdate(appointment.user, {
      $pull: { appointments: id },
    });

    res.json({ message: "Appointment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
