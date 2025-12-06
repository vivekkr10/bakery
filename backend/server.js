const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Razorpay = require("razorpay");

dotenv.config(); // Load .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // to serve uploaded files

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter to block videos & music
const fileFilter = (req, file, cb) => {
  const disallowedTypes = [
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
  ];

  if (disallowedTypes.includes(file.mimetype)) {
    return cb(new Error("File type not allowed (video or music)."), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log("✅ MongoDB connected to DB:", mongoose.connection.name)
  )
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Razorpay setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Routes
const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const productRoutes = require("./src/routes/productRoutes");
// REMOVE: const adminProductRoutes = require("./src/routes/adminProductRoutes");

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // This includes all admin product routes
app.use("/api/cart", cartRoutes);
app.use("/api/product", productRoutes); // Public product routes
// REMOVE: app.use("/api/admin", adminProductRoutes); // Remove duplicate

// Razorpay order creation route
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("API running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
