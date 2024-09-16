const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  phonePrefix: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return /^\d{1,3}$/.test(value);
      },
      message: "Invalid phone prefix format",
    },
  },
  phoneNumber: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return /^\d{6,10}$/.test(value);
      },
      message: "Invalid phone number format",
    },
  },
  formattedPhone: {
    type: String,
  },
  country: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],
});

clientSchema.pre("save", async function (next) {
  try {

    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(15);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const phone = `+${this.phonePrefix}${this.phoneNumber}`;
    const parsedPhoneNumber = parsePhoneNumberFromString(phone);

    if (parsedPhoneNumber && parsedPhoneNumber.isValid()) {
      this.formattedPhone = parsedPhoneNumber.formatInternational();
      this.country = parsedPhoneNumber.country;
    } else {
      return next(new Error("Invalid phone number"));
    }

    next();
  } catch (error) {
    next(error);
  }
});

clientSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Client", clientSchema);
