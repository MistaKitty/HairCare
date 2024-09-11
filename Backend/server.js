const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Routes
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
