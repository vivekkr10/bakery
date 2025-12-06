const express = require("express");
const router = express.Router();
const multer = require("multer");

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
} = require("../controllers/productController");

const adminMiddleware = require("../middlewares/adminMiddleware");

/* ============================
   PUBLIC ROUTES
============================ */

// GET ALL PRODUCTS
router.get("/all-products", getAllProducts);

// GET SINGLE PRODUCT
router.get("/single/:id", getProduct);

/* ============================
   ADMIN ROUTES
============================ */

// CREATE PRODUCT  (with multer)
router.post("/create", adminMiddleware, upload.array("images"), createProduct);

// UPDATE PRODUCT (admin + multer support)
router.put(
  "/update/:id",
  adminMiddleware,
  upload.array("images"),
  updateProduct
);
// DELETE PRODUCT
router.delete("/delete/:id", adminMiddleware, deleteProduct);

module.exports = router;
