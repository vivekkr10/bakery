const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Otp = require("../models/otp");

const { sendOTPEmail } = require("../utils/sendOTP");
const { sendWhatsAppOTP } = require("../utils/sendWhatsappOTP");
const generateOTP = require("../utils/generateOTP");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ success: false, message: "Already registered" });

    const otp = generateOTP();

    if (email) await sendOTPEmail(email, otp);
    if (phone) await sendWhatsAppOTP(`+91${phone}`, otp);

await Otp.create({
  email,
  phone,
  name,
  password, // ✅ THIS WAS MISSING
  code: otp,
  purpose: "register",
  expiresAt: Date.now() + 5 * 60 * 1000,
});



    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= SEND OTP ================= */
exports.sendOtp = async (req, res) => {
  const { email, phone, purpose = "register" } = req.body;

  const otp = generateOTP();

  if (email) await sendOTPEmail(email, otp);
  if (phone) await sendWhatsAppOTP(`+91${phone}`, otp);

  await Otp.create({
    email,
    phone,
    code: otp,
    purpose, // ✅ ADD
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  res.json({ success: true, message: "OTP sent successfully" });
};


/* ================= VERIFY OTP ================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, phone, otp, purpose } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP required",
      });
    }

    const query = {
      code: String(otp),
      expiresAt: { $gt: Date.now() },
    };

    // 🔥 MOST IMPORTANT FIX
    if (email) query.email = email;
    if (phone) query.phone = phone;

    // purpose optional rakho
    if (purpose) query.purpose = purpose;

    const record = await Otp.findOne(query).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully",
      purpose: record.purpose,
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};






/* ================= SET USERNAME ================= */
exports.setUsername = async (req, res) => {
  try {
    const { username, email, phone } = req.body;

    if (!username || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // 🔥 ONLY OTP WITH PASSWORD
  const otpRecord = await Otp.findOne({
  $or: [{ email }, { phone }],
  purpose: "register",
  password: { $exists: true },
  expiresAt: { $gt: Date.now() },
}).sort({ createdAt: -1 });
console.log("OTP RECORD FOUND:", otpRecord);

    if (!otpRecord || !otpRecord.password) {
      return res.status(400).json({
        success: false,
        message: "Registration expired. Please register again.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      String(otpRecord.password),
      10
    );

    const user = await User.create({
      name: otpRecord.name,
      email: otpRecord.email,
      phone: otpRecord.phone,
      username,
      password: hashedPassword,
      emailVerified: true,
    });

    await Otp.deleteMany({
      $or: [{ email }, { phone }],
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration complete",
      token,
      user,
    });
  } catch (error) {
    console.error("❌ setUsername error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete registration",
    });
  }
};


/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  if (user.isBlocked)
    return res.status(403).json({ success: false, message: "Account blocked" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.json({ success: true, token, user });
};

/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const otp = generateOTP();

  await Otp.create({
    email,
    code: otp,
    purpose: "forgot-password",
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  await sendOTPEmail(email, otp);

  res.json({ success: true, message: "OTP sent" });
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword)
    return res.status(400).json({ success: false, message: "Passwords mismatch" });

  const otpRecord = await Otp.findOne({ email, purpose: "forgot-password" });
  if (!otpRecord)
    return res.status(400).json({ success: false, message: "OTP expired" });

  const user = await User.findOne({ email });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await Otp.deleteMany({ email });

  res.json({ success: true, message: "Password reset successful" });
};

/* ================= LOGOUT ================= */
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};


