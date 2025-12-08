const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Added fs import
const Razorpay = require("razorpay");
const crypto = require("crypto");

dotenv.config();

const app = express();

// Debug middleware
app.use((req, res, next) => {
  if (req.url.includes('/uploads/')) {
    console.log('📤 Static file request:', {
      url: req.url,
      method: req.method,
      time: new Date().toISOString()
    });
  }
  next();
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== STATIC FILE SERVING ==================
console.log('📁 Server root directory:', __dirname);
console.log('📁 Current working directory:', process.cwd());

// Try multiple possible uploads locations
const possibleUploadPaths = [
  path.join(__dirname, "uploads"),
  path.join(__dirname, "src/uploads"),
  path.join(__dirname, "backend/uploads"),
  path.join(__dirname, "public/uploads"),
  path.join(__dirname, "src/upoads"), // In case of typo
];

let staticPathFound = false;
for (const uploadPath of possibleUploadPaths) {
  if (fs.existsSync(uploadPath)) {
    console.log(`✅ Found uploads folder at: ${uploadPath}`);
    app.use("/uploads", express.static(uploadPath));
    staticPathFound = true;
    break;
  }
}

if (!staticPathFound) {
  console.log('⚠️ No uploads folder found, creating one...');
  const defaultPath = path.join(__dirname, "uploads");
  fs.mkdirSync(defaultPath, { recursive: true });
  app.use("/uploads", express.static(defaultPath));
}

// ================== MULTER CONFIGURATION ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/products';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

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

// ================== DATABASE CONNECTION ==================
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/bakery")
  .then(() =>
    console.log("✅ MongoDB connected to DB:", mongoose.connection.name)
  )
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ================== RAZORPAY SETUP ==================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_Rn3xa74qiaEekq",
  key_secret: process.env.RAZORPAY_SECRET
});

console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "Loaded" : "Missing");

// ================== ROUTES ==================
const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const cartRoutes = require("./src/routes/cartRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const customizationRoutes = require('./src/routes/CustomizatonRoutes');
app.use('/uploads/designs', express.static(path.join(__dirname, 'uploads/designs')));
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api', customizationRoutes);
// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/products', express.static(path.join(__dirname, 'uploads/products')));
app.use('/uploads/designs', express.static(path.join(__dirname, 'uploads/designs'))); // Add this
// ================== DIAGNOSTIC ROUTES ==================

// Check if specific file exists
app.get("/api/test-image", (req, res) => {
  const filename = "1765105914744-banana.jpeg";
  const possiblePaths = [
    path.join(__dirname, "uploads/products", filename),
    path.join(__dirname, "src/uploads/products", filename),
    path.join(__dirname, "backend/uploads/products", filename),
    path.join(__dirname, "src/upoads/products", filename),
  ];

  let foundPath = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      foundPath = testPath;
      break;
    }
  }

  if (foundPath) {
    res.json({
      exists: true,
      path: foundPath,
      url: `http://localhost:5000/uploads/products/${filename}`,
      accessible: true
    });
  } else {
    res.json({
      exists: false,
      message: "File not found in any location",
      searchedPaths: possiblePaths
    });
  }
});

// List all files in uploads
app.get("/api/check-files", (req, res) => {
  const possiblePaths = [
    path.join(__dirname, "uploads/products"),
    path.join(__dirname, "src/uploads/products"),
    path.join(__dirname, "backend/uploads/products"),
    path.join(__dirname, "src/upoads/products"),
  ];

  const results = [];
  
  for (const uploadsPath of possiblePaths) {
    try {
      if (fs.existsSync(uploadsPath)) {
        const files = fs.readdirSync(uploadsPath);
        results.push({
          path: uploadsPath,
          exists: true,
          count: files.length,
          files: files.slice(0, 10)
        });
      } else {
        results.push({
          path: uploadsPath,
          exists: false
        });
      }
    } catch (error) {
      results.push({
        path: uploadsPath,
        exists: false,
        error: error.message
      });
    }
  }
  
  res.json({
    serverRoot: __dirname,
    cwd: process.cwd(),
    results
  });
});

// Check specific file
app.get("/api/check-file/:filename", (req, res) => {
  const filename = req.params.filename;
  const possiblePaths = [
    path.join(__dirname, "uploads/products", filename),
    path.join(__dirname, "src/uploads/products", filename),
    path.join(__dirname, "backend/uploads/products", filename),
    path.join(__dirname, "src/upoads/products", filename),
  ];

  const results = [];
  
  for (const filePath of possiblePaths) {
    const exists = fs.existsSync(filePath);
    results.push({
      path: filePath,
      exists,
      url: `http://localhost:5000/uploads/products/${filename}`
    });
    
    if (exists) {
      const stats = fs.statSync(filePath);
      results[results.length - 1].stats = {
        size: stats.size,
        modified: stats.mtime,
        permissions: stats.mode.toString(8)
      };
    }
  }
  
  const anyExists = results.some(r => r.exists);
  
  res.json({
    filename,
    anyExists,
    results,
    testUrl: `http://localhost:5000/uploads/products/${filename}`
  });
});

// Debug folder structure
app.get("/api/debug-structure", (req, res) => {
  const getStructure = (dir, depth = 0) => {
    if (depth > 3) return '...';
    
    try {
      if (!fs.existsSync(dir)) {
        return 'Directory does not exist';
      }
      
      const items = fs.readdirSync(dir, { withFileTypes: true });
      const structure = {};
      
      for (const item of items) {
        if (item.isDirectory()) {
          if (depth < 2) { // Limit recursion depth
            structure[item.name + '/'] = getStructure(path.join(dir, item.name), depth + 1);
          } else {
            structure[item.name + '/'] = '...';
          }
        } else if (depth < 3) {
          structure[item.name] = `file (${fs.statSync(path.join(dir, item.name)).size} bytes)`;
        }
      }
      
      return structure;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };
  
  res.json({
    __dirname: __dirname,
    process_cwd: process.cwd(),
    serverRootStructure: getStructure(__dirname),
    uploadsExists: fs.existsSync(path.join(__dirname, 'uploads')),
    srcUploadsExists: fs.existsSync(path.join(__dirname, 'src/uploads')),
    srcUpoadsExists: fs.existsSync(path.join(__dirname, 'src/upoads')),
    currentDirectory: process.cwd()
  });
});

// Manual file serving fallback
app.get('/uploads/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const possiblePaths = [
    path.join(__dirname, 'uploads', folder, filename),
    path.join(__dirname, 'src/uploads', folder, filename),
    path.join(__dirname, 'backend/uploads', folder, filename),
    path.join(__dirname, 'src/upoads', folder, filename),
  ];
  
  console.log('📤 Manual file request for:', filename);
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log('✅ Found file at:', filePath);
      return res.sendFile(filePath);
    }
  }
  
  res.status(404).json({ 
    error: 'File not found',
    searchedPaths: possiblePaths 
  });
});

// ================== RAZORPAY ROUTES ==================

// Create Razorpay order
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid amount" 
      });
    }

    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    console.log("📦 Creating Razorpay order for amount:", amountInPaise);

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      created_at: order.created_at
    });
  } catch (error) {
    console.error("❌ Razorpay order creation failed:", error);
    
    let errorMessage = "Server error";
    if (error.error && error.error.description) {
      errorMessage = error.error.description;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: error.error || error 
    });
  }
});

// Verify Razorpay payment signature
app.post("/api/payment/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing payment details" 
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    console.log("🔍 Verifying signature:", {
      razorpay_signature,
      expectedSignature,
      isMatch: expectedSignature === razorpay_signature
    });

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature"
      });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
        captured: payment.captured
      }
    });
  } catch (error) {
    console.error("❌ Razorpay verification failed:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed",
      error: error.message 
    });
  }
});

// Get payment details
app.get("/api/payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error("❌ Fetch payment failed:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch payment details" 
    });
  }
});

// ================== TEST ROUTES ==================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    razorpay: process.env.RAZORPAY_KEY_ID ? "Configured" : "Not configured",
    uploadsPath: path.join(__dirname, "uploads")
  });
});

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Bakery Store API is running 🚀",
    endpoints: {
      diagnostic: {
        checkFiles: "GET /api/check-files",
        debugStructure: "GET /api/debug-structure",
        testImage: "GET /api/test-image",
        checkFile: "GET /api/check-file/:filename"
      },
      payment: {
        createOrder: "POST /api/payment/create-order",
        verify: "POST /api/payment/verify",
        getPayment: "GET /api/payment/:paymentId"
      },
      orders: "GET/POST /api/orders",
      products: "GET /api/product",
      cart: "GET/POST /api/cart",
      auth: "POST /api/auth"
    },
    health: "GET /health"
  });
});

// ================== ERROR HANDLING ==================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// ================== START SERVER ==================

// Diagnostic log before starting
console.log('\n🔍 DIAGNOSTIC INFORMATION:');
console.log('📁 Server root:', __dirname);
console.log('📁 Current directory:', process.cwd());

// Check for banana image
const bananaPaths = [
  path.join(__dirname, "uploads/products/1765105914744-banana.jpeg"),
  path.join(__dirname, "src/uploads/products/1765105914744-banana.jpeg"),
  path.join(__dirname, "src/upoads/products/1765105914744-banana.jpeg")
];

bananaPaths.forEach((p, i) => {
  console.log(`🍌 Path ${i + 1}: ${p}`);
  console.log(`   Exists: ${fs.existsSync(p) ? '✅' : '❌'}`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Razorpay Key: ${process.env.RAZORPAY_KEY_ID ? "Configured" : "NOT CONFIGURED - Check .env file"}`);
  console.log(`📤 Static files served from: ${staticPathFound ? 'Found uploads folder' : 'Default location'}`);
  console.log('\n💡 Test these URLs:');
  console.log(`   • http://localhost:${PORT}/api/check-files`);
  console.log(`   • http://localhost:${PORT}/api/test-image`);
  console.log(`   • http://localhost:${PORT}/uploads/products/1765105914744-banana.jpeg`);
});