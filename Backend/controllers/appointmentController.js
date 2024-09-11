const Appointment = require("../models/Appointment");

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("client")
      .populate("service");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment(req.body); 
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: "Bad Request", error: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: "Bad Request", error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(400).json({ message: "Bad Request", error: err.message });
  }
};
