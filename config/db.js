const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const USE_REMOTE_DB = process.env.USE_REMOTE_DB === "true";
const MONGO_URI = USE_REMOTE_DB
  ? process.env.MONGO_URI_REMOTE
  : process.env.MONGO_URI_LOCAL;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const connectionType = USE_REMOTE_DB ? "remote" : "local";
    console.log(`MongoDB connected (${connectionType})`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
