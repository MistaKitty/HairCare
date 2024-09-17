const Client = require("../models/Client");

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createClient = async (req, res) => {
  const { name, email, phonePrefix, phoneNumber, password } = req.body;

  if (!name || !email || !phonePrefix || !phoneNumber || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const client = new Client({
      name: name,
      email: email,
      phonePrefix: phonePrefix,
      phoneNumber: phoneNumber,
      password: password,
    });

    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: "Bad Request", error: err.message });
  }
};

exports.updateClient = async (req, res) => {
  const { phonePrefix, phoneNumber, ...rest } = req.body;
  let phoneDetails = {};

  if (phonePrefix && phoneNumber) {
    phoneDetails = { phonePrefix, phoneNumber };
  }

  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...rest, ...phoneDetails },
      { new: true }
    );
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: "Bad Request" });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted" });
  } catch (err) {
    res.status(400).json({ message: "Bad Request" });
  }
};
