
const Admin = require("../models/Admin");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const CustomCakeOrder = require("../models/CustomCakeOrder");

/* ================= SUPER ADMIN ================= */



exports.registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;


    if (!secretKey) {
      return res.status(400).json({
        message: "Secret key is required",
      });
    }

    if (String(secretKey).trim() !== String(process.env.SUPER_ADMIN_SECRET).trim()) {
      return res.status(403).json({
        message: "Invalid secret key",
      });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: "super-admin",
    });

    res.status(201).json({
      success: true,
      message: "Super admin registered successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("❌ Super Admin Register Error:", err);
    res.status(500).json({ message: err.message });
  }
};




exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = admin.generateToken();

    res.json({
      success: true,
      token,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMINS ================= */

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin exists" });

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || "admin",
    });

    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdmins = async (req, res) => {
  const admins = await Admin.find()
    .select("-password")
    .sort({ createdAt: -1 }); // 🔥 NEWEST FIRST

  res.json({ success: true, admins });
};


exports.deleteAdmin = async (req, res) => {
  if (req.admin._id.toString() === req.params.id) {
    return res.status(400).json({
      success: false,
      message: "You cannot delete yourself",
    });
  }

  await Admin.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};


/* ================= PRODUCTS ================= */

exports.getAdminProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    products: products.map((p) => ({
      ...p.toObject(),
      images: p.getImageUrls(), // ✅ FIX
    })),
  });
};

exports.createProduct = async (req, res) => {
  try {
    const images =
      req.cloudinaryFiles?.length > 0
        ? req.cloudinaryFiles
        : req.localFiles || [];

    const product = await Product.create({
      ...req.body,
      images,
      cloudinaryPublicIds: req.cloudinaryPublicIds || [],
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("❌ Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};


exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, product });
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

/* ================= USERS ================= */

exports.getUsers = async (req, res) => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 }); // 🔥 NEWEST FIRST

  res.json({ success: true, users });
};


exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

/* ================= ORDERS ================= */

exports.getOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.json({ success: true, orders });
};


/* ================= UPDATE ORDER STATUS ================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "pending",
      "confirmed",
      "preparing",
      "out-for-delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

/* ================= DELETE ORDER ================= */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
    });
  }
};

/* ================= BLOCK / UNBLOCK USER ================= */
exports.blockUnblockUser = async (req, res) => {
  try {
    const { blocked } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: blocked },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: blocked ? "User blocked" : "User unblocked",
      user,
    });
  } catch (error) {
    console.error("❌ Block/Unblock user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

/* ================= ADMIN PROFILE ================= */

/* ================= ADMIN PROFILE ================= */

exports.getAdminProfile = async (req, res) => {
  try {
    // Use req.admin._id instead of req.admin.id
    const admin = await Admin.findById(req.admin._id).select("-password");
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.json({
      success: true,
      admin
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    // Use req.admin._id here too
    const admin = await Admin.findByIdAndUpdate(
      req.admin._id, // Changed from req.admin.id
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      admin
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadAdminProfilePic = async (req, res) => {
  try {
    // Use req.admin._id
    const adminId = req.admin._id;
    
    if (!req.cloudinaryFiles || req.cloudinaryFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded"
      });
    }

    const profilePicture = req.cloudinaryFiles[0];

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { profilePicture },
      { new: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: admin.profilePicture
    });
  } catch (err) {
    console.error("Upload profile pic error:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

