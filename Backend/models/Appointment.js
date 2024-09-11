const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
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
  duration: { type: Number },
  status: {
    type: String,
    enum: ["confirmed", "pending", "cancelled"],
    default: "pending",
  },
  location: {
    street: { type: String },
    postalCode: { type: String, required: true },
    number: { type: String },
    floor: { type: String },
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
