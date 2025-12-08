const express = require("express");
const router = express.Router();

const {
  createOrder,
  createSimpleOrder, // Add this
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} = require("../controllers/orderController");

const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// USER ROUTES
router.post("/create", authMiddleware, createOrder); // For both static & DB products
router.post("/create-simple", authMiddleware, createSimpleOrder); // For static data only
router.post("/verify-payment", verifyPayment);
router.get("/my", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/cancel/:id", authMiddleware, cancelOrder);

// ADMIN ROUTES
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOrders);
router.get("/admin/stats", authMiddleware, adminMiddleware, getOrderStats);
router.put(
  "/admin/status/:id",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

module.exports = router;
