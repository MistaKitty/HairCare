const nodemailer = require("nodemailer");

const sendWelcomeEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Our Salon!",
    text: `Hello ${name},\n\nThank you for registering! We're glad to have you with us.\n\nBest regards,\nThe Salon Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send welcome email");
  }
};

module.exports = { sendWelcomeEmail };
