import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function UpdateProductModal({ productId, onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    tags: "",
    isFeatured: false,
  });

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("adminToken");

  // Load Product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/product/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const p = res.data.product;

        setForm({
          name: p.name || "",
          description: p.description || "",
          price: p.price || "",
          category: p.category || "",
          stock: p.stock || "",
          tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
          isFeatured: p.isFeatured || false,
        });
        toast.success("Product loaded successfully!");
      } catch (error) {
        console.error("Load product error:", error.response?.data || error);
        toast.error(error.response?.data?.message || "Failed to load product!");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProduct();
    }
  }, [productId, token]);

  // Handle input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatePromise = axios.put(
      `http://localhost:5000/api/admin/product/${productId}`,
      {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.promise(updatePromise, {
      loading: "Updating product...",
      success: (response) => {
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
        return "Product updated successfully!";
      },
      error: (error) => {
        console.error("Update error:", error.response?.data || error);
        return error.response?.data?.message || "Failed to update product!";
      },
    });
  };

  // Cancel button handler
  const handleCancel = () => {
    toast("Update cancelled", {
      icon: "⚠️",
      duration: 2000,
    });
    onClose();
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading product…</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="w-[95%] max-w-3xl bg-white rounded-2xl shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g., Cakes, Desserts"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Available quantity"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3 (comma separated)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isFeatured" className="text-gray-700 font-medium">
              Mark as Featured Product
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Product
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
