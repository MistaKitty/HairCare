const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI_REMOTE || process.env.MONGO_URI_LOCAL;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const connectionType =
      MONGO_URI === process.env.MONGO_URI_REMOTE ? "remote" : "local";
    console.log(`MongoDB connected (${connectionType})`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
