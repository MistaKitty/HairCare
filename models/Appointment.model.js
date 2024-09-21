const mongoose = require("mongoose");

const serviceDetailSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  serviceName: { type: String, required: true },
  duration: { type: Number, required: true },
});

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  appointment: {
    services: [serviceDetailSchema],
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
  },
  billing: {
    fee: { type: String },
    total: { type: String },
    servicePrice: { type: String },
    serviceDuration: { type: String },
  },
  travel: {
    travelDuration: { type: String },
    distance: { type: String },
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
