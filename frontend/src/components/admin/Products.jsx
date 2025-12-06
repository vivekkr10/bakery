import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateProductModal from "./CreateProduct";
import UpdateProductModal from "./UpdateProduct";
import toast, { Toaster } from "react-hot-toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const res = await axios.get("http://localhost:5000/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(err.response?.data?.message || "Failed to load products");
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = (newProduct) => {
    if (!newProduct) return;
    setProducts((prev) => [...prev, newProduct]);
    toast.success("Product added successfully!");
  };

  const handleDeleteProduct = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(
        `http://localhost:5000/api/admin/product/${deleteProductId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));
      setShowDeleteModal(false);
      setDeleteProductId(null);

      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="p-6 lg:ml-64 text-[#6a4a2b]">
      <Toaster position="top-right" />

      <h2 className="text-2xl font-bold mb-4 text-[#8B5E3C]">Products</h2>

      <button
        onClick={() => setShowModal(true)}
        className="mb-4 px-4 py-2 bg-[#8B5E3C] text-white rounded-lg hover:bg-[#6a4a2b] transition shadow-md"
      >
        + Add New Product
      </button>

      <div className="bg-white p-4 rounded-xl shadow-lg overflow-auto border border-[#e6e0db]">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#f7e8dc] text-[#6a4a2b]">
              <th className="py-4 px-5 text-left font-semibold">Product</th>
              <th className="py-4 px-5 text-left font-semibold">Category</th>
              <th className="py-4 px-5 text-left font-semibold">Price</th>
              <th className="py-4 px-5 text-left font-semibold">Stock</th>
              <th className="py-4 px-5 text-left font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-5">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-red-500">
                  {error}
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-[#e6e0db] hover:bg-[#fff9f4] transition"
                >
                  <td className="py-4 px-5">{p.name}</td>
                  <td className="py-4 px-5">{p.category}</td>
                  <td className="py-4 px-5 font-medium">₹{p.price}</td>
                  <td className="py-4 px-5">{p.stock}</td>

                  <td className="py-4 px-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProductId(p._id);
                          setShowUpdateModal(true);
                        }}
                        className="px-3 py-1.5 bg-[#d69e64] hover:bg-[#c17f45] text-white rounded text-sm transition"
                      >
                        Update
                      </button>

                      <button
                        onClick={() => {
                          setDeleteProductId(p._id);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE PRODUCT MODAL */}
      {showModal && (
        <CreateProductModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveProduct}
        />
      )}

      {/* UPDATE PRODUCT MODAL */}
      {showUpdateModal && (
        <UpdateProductModal
          productId={selectedProductId}
          onClose={() => setShowUpdateModal(false)}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl border border-[#e6e0db]">
            <h3 className="text-xl font-semibold text-[#8B5E3C] mb-4">
              Delete Product?
            </h3>

            <p className="text-[#6a4a2b] mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-[#6a4a2b] rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
