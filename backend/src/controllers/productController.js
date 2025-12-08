const Product = require("../models/Product");
const slugify = require("slugify");
const path = require("path");
/* =====================================================
   CREATE PRODUCT (ADMIN)
===================================================== */
// controllers/productController.js - Update createProduct function
exports.createProduct = async (req, res) => {
  try {
    console.log("📁 Uploaded files:", req.files);

    const { name, description, price, category, stock, tags, isFeatured } =
      req.body;

    // Handle image paths
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Store relative path from server root
        const imagePath = `/uploads/products/${file.filename}`;
        console.log("🖼️ Saving image path:", imagePath);
        images.push(imagePath);
      });
    } else {
      console.log("⚠️ No images uploaded");
    }

    const product = await Product.create({
      name,
      slug: slugify(name, { lower: true }),
      description,
      price: Number(price),
      category,
      images,
      stock: Number(stock) || 0,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      isFeatured: isFeatured === "true",
      createdBy: req.admin?.id,
    });

    res.status(201).json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (err) {
    console.error("❌ Create product error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =====================================================
   GET ALL PRODUCTS
===================================================== */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 100,
    } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(
        sort === "price_asc"
          ? { price: 1 }
          : sort === "price_desc"
          ? { price: -1 }
          : { createdAt: -1 }
      )
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    // Format products with proper image URLs
    const formattedProducts = products.map((product) => {
      const productObj = product.toObject();

      // Ensure images have correct paths
      if (productObj.images && productObj.images.length > 0) {
        productObj.images = productObj.images.map((img) => {
          if (img.startsWith("http")) {
            return img;
          } else if (img.startsWith("/uploads/")) {
            return img; // Already correct
          } else {
            return `/uploads/products/${img}`;
          }
        });
      }

      return productObj;
    });

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products: formattedProducts,
    });
  } catch (err) {
    console.error("❌ Get products error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =====================================================
   UPDATE PRODUCT
===================================================== */
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const data = req.body;
    if (data.name) data.slug = slugify(data.name, { lower: true });

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/products/${file.filename}`
      );
      data.images = [...product.images, ...newImages];
    }

    product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   DELETE PRODUCT
===================================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET SINGLE PRODUCT
===================================================== */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Format images
    const productObj = product.toObject();
    if (productObj.images && productObj.images.length > 0) {
      productObj.images = productObj.images.map((img) => {
        if (img.startsWith("http")) {
          return img;
        } else if (img.startsWith("/uploads/")) {
          return img;
        } else {
          return `/uploads/products/${img}`;
        }
      });
    }

    res.json({ success: true, product: productObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   DELETE PRODUCT
===================================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET ALL PRODUCTS (SEARCH + FILTER + PAGINATION)
===================================================== */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 100,
    } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(
        sort === "price_asc"
          ? { price: 1 }
          : sort === "price_desc"
          ? { price: -1 }
          : { createdAt: -1 }
      )
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products: products.map((product) => ({
        ...product.toObject(),
        images: product.images.map((img) => {
          // Ensure proper URL format
          if (img.startsWith("/")) {
            return img; // Already has correct path
          } else if (!img.includes("/uploads/")) {
            return `/uploads/products/${img}`;
          }
          return img;
        }),
      })),
    });
  } catch (err) {
    console.error("❌ Get products error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =====================================================
   GET SINGLE PRODUCT
===================================================== */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
