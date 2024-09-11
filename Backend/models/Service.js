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
    parish: { type: String }, // Municipality or district
    locality: { type: String }, // Locality
    postalDesignation: { type: String }, // Postal designation
    street: { type: String }, // Street or road
    local: { type: String },
    coordinates: {
      type: [Number], // [latitude, longitude]
    },
  },
  travelFee: { type: Number },
});

module.exports = mongoose.model("Service", serviceSchema);
