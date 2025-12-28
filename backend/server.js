const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const Razorpay = require("razorpay");
const crypto = require("crypto");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://bakery-oa9j.vercel.app",
      "https://bakery-website-jet.vercel.app",
      "https://bakery-oa9j-git-main-graphura-india-pvt-ltds-projects.vercel.app",
      "https://bakery-oa9j-vboodczv7-graphura-india-pvt-ltds-projects.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "cache-control",
      "X-Requested-With",
    ],
  })
);

// 🔥 IMPORTANT for preflight
// app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log every request.
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

/* ===================== STATIC FILES ===================== */
const uploadsRoot = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

app.use("/uploads", express.static(uploadsRoot));

/* ===================== DATABASE ===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

/* ===================== RAZORPAY SETUP ===================== */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/* ===================== ROUTES ===================== */
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const productRoutes = require("./src/routes/productRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const contactRoutes = require("./src/routes/ContactRoutes");
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", adminRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", contactRoutes);

/* ===================== RAZORPAY ROUTES ===================== */
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("❌ Razorpay order error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
});

app.post("/api/payment/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("❌ Razorpay verify error:", error.message);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
});

/* ===================== ORDER ROUTES (FRONTEND COMPATIBLE) ===================== */

// Create order (used by OrderNow.jsx)
app.post("/api/orders/create-simple", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items provided",
      });
    }

    const amount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    });

    res.status(200).json({
      success: true,
      order: {
        _id: `order_${Date.now()}`,
        items,
        amount,
        status: "pending",
      },
      razorpayOrder,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
});

// Verify payment (used by OrderNow.jsx)
app.post("/api/orders/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
});

/* ===================== HEALTH ===================== */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server running",
    mongoReadyState: mongoose.connection.readyState,
  });
});

/* ===================== ROOT ===================== */
app.get("/", (req, res) => {
  res.json({
    message: "Bakery API running 🚀",
  });
});

/* ===================== 404 HANDLER (LAST) ===================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

/* ===================== ERROR HANDLER ===================== */
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* ===================== START SERVER ===================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
