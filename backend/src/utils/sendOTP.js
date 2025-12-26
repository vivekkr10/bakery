const nodemailer = require("nodemailer");
const { otpTemplate } = require("./emailTemplates");

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Graphura" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Your OTP",
      html: otpTemplate(otp),
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP email sent to:", email);
  } catch (err) {
    console.error("OTP Email Error:", err);
    throw new Error("Failed to send OTP Email");
  }
};

module.exports = { sendOTPEmail };
