const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  treatments: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  location: {
    postalCodePrefix: { type: Number, required: true }, // First 4 digits of the postal code
    postalCodeSuffix: { type: Number, required: true }, // Last 3 digits of the postal code
    number: { type: String },
    floor: { type: String },
    county: { type: String },
    parish: { type: String },
    locality: { type: String },
    postalDesignation: { type: String },
    street: { type: String },
    local: { type: String },
    coordinates: {
      type: [String],
    },
  },
  travelFee: { type: Number },
});

module.exports = mongoose.model("Service", serviceSchema);
