const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  date: {
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    hour: { type: Number, required: true },
    minute: { type: Number, required: true },
  },
  location: {
    postalCodePrefix: { type: String, required: true },
    postalCodeSuffix: { type: String, required: true },
    number: { type: String, required: true },
    floor: { type: String },
    street: { type: String },
    locality: { type: String },
    parish: { type: String },
    county: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    localInfo: { type: String },
  },
  notes: { type: String },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
