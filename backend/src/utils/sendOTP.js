// const axios = require("axios");
// const { otpTemplate } = require("./emailTemplates");

// const sendOTPEmail = async (email, otp) => {
//   try {
//     const response = await axios.post(
//       "https://api.brevo.com/v3/smtp/email",
//       {
//         sender: { email: process.env.FROM_EMAIL, name: "Graphura" },
//         to: [{ email }],
//         subject: "Your OTP Code",
//         htmlContent: otpTemplate(otp),
//       },
//       {
//         headers: {
//           "api-key": process.env.BREVO_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("📧 Brevo OTP sent:", response.data);
//   } catch (err) {
//     console.error("❌ Brevo OTP Error:", err.response?.data || err.message);
//     throw new Error("Failed to send OTP Email");
//   }
// };

// module.exports = { sendOTPEmail };

const axios = require("axios");
const { otpTemplate } = require("./emailTemplates");

const sendOTPEmail = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.FROM_EMAIL,
          name: "Graphura",
        },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: otpTemplate(otp),
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📧 Brevo OTP sent:", response.data);
    return true;
  } catch (err) {
    console.error("❌ Brevo OTP Error:", err?.response?.data || err.message);

    // ❗ IMPORTANT — do NOT crash the backend
    return false;
  }
};

module.exports = { sendOTPEmail };
