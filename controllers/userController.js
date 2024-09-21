const User = require("../models/User.model");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, phonePrefix, phoneNumber, password, role } = req.body;

  if (!name || !email || !phonePrefix || !phoneNumber || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = new User({
      name,
      email,
      phonePrefix,
      phoneNumber,
      password,
      role: role || "client",
    });

    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: "Bad Request", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { phonePrefix, phoneNumber, role, ...rest } = req.body;
  let updateData = { ...rest };

  if (phonePrefix && phoneNumber) {
    updateData = { ...updateData, phonePrefix, phoneNumber };
  }

  if (role) {
    updateData.role = role;
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Bad Request", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ message: "Bad Request" });
  }
};
