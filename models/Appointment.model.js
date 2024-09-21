const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "canceled", "rescheduled", "confirmed"],
    default: "pending",
  },
  reason: { type: String },
  date: { type: Date, required: true },
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
  description: { type: String },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
