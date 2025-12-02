const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String },
    phone: { type: String },
    code: { type: String, required: true },
    name: { type: String },
    password: { type: String },

    // Expires in 5 minutes
    expiresAt: {
      type: Date,
      default: () => Date.now() + 5 * 60 * 1000,
      expires: 300
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
