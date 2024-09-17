const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  users: { type: mongoose.Schema.Types.ObjectId, ref: "Users.model", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
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
  status: {
    type: String,
    enum: ["pendente", "cancelado", "remarcado", "confirmado"],
    default: "pendente",
  },
  reason: { type: String },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
