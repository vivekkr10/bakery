const Order = require("../models/Order");
const Product = require("../models/Product");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/* =====================================================
   CREATE ORDER (USER) - Handles both static & DB products
===================================================== */
exports.createOrder = async (req, res) => {
  try {
    console.log("🔍 CREATE ORDER REQUEST:");
    console.log("User:", req.user);
    console.log("User ID:", req.user?._id);

    const { items, shippingAddress, paymentMethod } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error("❌ No user found in request");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user._id;
    console.log("📝 Processing order for user ID:", userId);

    if (!items || !items.length) {
      console.error("❌ No items in cart");
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate required shipping fields
    if (!shippingAddress) {
      console.error("❌ No shipping address");
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredFields = [
      "name",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
        console.error(`❌ Missing field: ${field}`);
        return res.status(400).json({
          success: false,
          message: `Please fill in ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}`,
        });
      }
    }

    // Validate phone number
    if (
      shippingAddress.phone.length !== 10 ||
      !/^\d+$/.test(shippingAddress.phone)
    ) {
      console.error("❌ Invalid phone number:", shippingAddress.phone);
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    // Validate each item and calculate total
    for (const item of items) {
      console.log(`🔍 Processing item:`, item);

      // Check if item has a product ID (from database) or is static data
      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        // This is a database product - validate it exists
        const product = await Product.findById(item.product);

        if (!product) {
          console.error(`❌ Database product not found: ${item.product}`);
          return res.status(404).json({
            success: false,
            message: `Product "${item.name}" not found in database`,
          });
        }

        console.log(
          `📦 Found database product: ${product.name}, Stock: ${product.stock}, Requested: ${item.qty}`
        );

        if (product.stock < item.qty) {
          console.error(`❌ Insufficient stock for ${product.name}`);
          return res.status(400).json({
            success: false,
            message: `"${product.name}" is out of stock. Only ${product.stock} available`,
          });
        }

        if (item.qty < 1) {
          console.error(`❌ Invalid quantity for ${product.name}: ${item.qty}`);
          return res.status(400).json({
            success: false,
            message: `Quantity for "${product.name}" must be at least 1`,
          });
        }

        totalAmount += product.price * item.qty;

        validatedItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          qty: item.qty,
          img: item.img || product.images?.[0] || "",
        });
      } else {
        // This is static/Redux data - just use the provided values
        console.log(`📦 Processing static product: ${item.name}`);

        if (!item.name || !item.price || !item.qty) {
          console.error(`❌ Invalid static product data:`, item);
          return res.status(400).json({
            success: false,
            message: `Invalid product data for "${item.name || "unknown"}"`,
          });
        }

        if (item.qty < 1) {
          console.error(`❌ Invalid quantity for ${item.name}: ${item.qty}`);
          return res.status(400).json({
            success: false,
            message: `Quantity for "${item.name}" must be at least 1`,
          });
        }

        totalAmount += item.price * item.qty;

        validatedItems.push({
          name: item.name,
          price: item.price,
          qty: item.qty,
          img: item.img || item.image || "",
        });
      }
    }

    console.log(`💰 Total amount calculated: ${totalAmount}`);

    // Add tax (10%) and delivery charge (assuming 40)
    const tax = totalAmount * 0.1;
    const deliveryCharge = 40;
    const grandTotal = totalAmount + tax + deliveryCharge;

    console.log(
      `📊 Order summary: Subtotal=${totalAmount}, Tax=${tax}, Delivery=${deliveryCharge}, Total=${grandTotal}`
    );

    // Create Razorpay order if payment method is razorpay
    let razorpayOrder = null;
    if (paymentMethod === "razorpay") {
      try {
        console.log(
          `💳 Creating Razorpay order for amount: ${grandTotal * 100} paise`
        );
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(grandTotal * 100), // Convert to paise
          currency: "INR",
          receipt: `receipt_${Date.now()}_${userId.toString().slice(-6)}`,
        });
        console.log(`✅ Razorpay order created: ${razorpayOrder.id}`);
      } catch (razorpayError) {
        console.error("❌ Razorpay order creation error:", razorpayError);
        return res.status(500).json({
          success: false,
          message: "Failed to create payment order. Please try again.",
        });
      }
    }

    // Create order in database
    console.log(`💾 Creating order in database for user: ${userId}`);
    const order = await Order.create({
      user: userId,
      items: validatedItems,
      shippingAddress,
      totalAmount: grandTotal,
      subtotal: totalAmount,
      tax: tax,
      deliveryCharge: deliveryCharge,
      paymentMethod: paymentMethod || "razorpay",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      razorpay: razorpayOrder
        ? {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          }
        : {},
      orderStatus: "created",
    });

    console.log(`✅ Order created successfully: ${order._id}`);

    res.status(201).json({
      success: true,
      order,
      razorpayOrder,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

/* =====================================================
   CREATE SIMPLE ORDER - For static data only
===================================================== */
exports.createSimpleOrder = async (req, res) => {
  try {
    console.log("🔍 CREATE SIMPLE ORDER REQUEST (for static data):");
    console.log("User:", req.user);

    const { items, shippingAddress, paymentMethod } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user._id;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate required shipping fields
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredFields = [
      "name",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || shippingAddress[field].trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Please fill in ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()}`,
        });
      }
    }

    // Validate phone number
    if (
      shippingAddress.phone.length !== 10 ||
      !/^\d+$/.test(shippingAddress.phone)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    // Process static items (no database validation)
    for (const item of items) {
      if (!item.name || !item.price || !item.qty) {
        return res.status(400).json({
          success: false,
          message: `Invalid product data for "${item.name || "unknown"}"`,
        });
      }

      if (item.qty < 1) {
        return res.status(400).json({
          success: false,
          message: `Quantity for "${item.name}" must be at least 1`,
        });
      }

      totalAmount += item.price * item.qty;

      validatedItems.push({
        name: item.name,
        price: item.price,
        qty: item.qty,
        img: item.img || item.image || "",
      });
    }

    // Add tax (10%) and delivery charge (assuming 40)
    const tax = totalAmount * 0.1;
    const deliveryCharge = 40;
    const grandTotal = totalAmount + tax + deliveryCharge;

    // Create Razorpay order if payment method is razorpay
    let razorpayOrder = null;
    if (paymentMethod === "razorpay") {
      try {
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          receipt: `receipt_${Date.now()}_${userId.toString().slice(-6)}`,
        });
      } catch (razorpayError) {
        console.error("Razorpay order creation error:", razorpayError);
        return res.status(500).json({
          success: false,
          message: "Failed to create payment order. Please try again.",
        });
      }
    }

    // Create order in database
    const order = await Order.create({
      user: userId,
      items: validatedItems,
      shippingAddress,
      totalAmount: grandTotal,
      subtotal: totalAmount,
      tax: tax,
      deliveryCharge: deliveryCharge,
      paymentMethod: paymentMethod || "razorpay",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      razorpay: razorpayOrder
        ? {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          }
        : {},
      orderStatus: "created",
    });

    res.status(201).json({
      success: true,
      order,
      razorpayOrder,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Create simple order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

/* =====================================================
   VERIFY PAYMENT & UPDATE STOCK
===================================================== */
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, razorpayOrderId } = req.body;

    if (!orderId || !paymentId || !signature || !razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Verify Razorpay signature
    const body = razorpayOrderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    const isValidSignature = expectedSignature === signature;

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if payment already processed
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
    }

    // Update order payment details
    order.paymentStatus = "paid";
    order.razorpay.paymentId = paymentId;
    order.razorpay.signature = signature;
    order.orderStatus = "confirmed";
    order.paidAt = new Date();

    // Reduce stock for database products only
    for (const item of order.items) {
      if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.qty },
        });
      }
    }

    await order.save();

    res.json({
      success: true,
      order,
      message: "Payment verified and order confirmed successfully",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

/* =====================================================
   USER ORDERS
===================================================== */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/* =====================================================
   GET SINGLE ORDER DETAILS
===================================================== */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: id,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN → ALL ORDERS
===================================================== */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/* =====================================================
   UPDATE ORDER STATUS (ADMIN)
===================================================== */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = [
      "created",
      "confirmed",
      "preparing",
      "out-for-delivery",
      "delivered",
      "cancelled",
      "returned",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update status and timestamps
    order.orderStatus = status;

    if (status === "delivered") {
      order.deliveredAt = new Date();
    } else if (status === "cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

/* =====================================================
   CANCEL ORDER (USER)
===================================================== */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: id,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = ["delivered", "out-for-delivery"];
    if (nonCancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`,
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Update order status
    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();

    await order.save();

    res.json({
      success: true,
      order,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

/* =====================================================
   GET ORDER STATISTICS (ADMIN)
===================================================== */
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ["created", "confirmed", "preparing"] },
    });

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};
