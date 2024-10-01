const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  treatments: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  hairLength: {
    type: String,
    enum: ["Short", "Medium", "Long", "Extra Long"],
    required: true,
  },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Service", serviceSchema);
