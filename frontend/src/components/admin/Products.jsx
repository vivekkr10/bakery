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

  // 🔥 RESPONSIVE STATE (mobile + tablet + nest hub)
  const [isCompact, setIsCompact] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const res = await axios.get("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(res.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = () => {
    toast.success("Product added successfully!");
    fetchProducts();
  };

  const handleDeleteProduct = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(`/api/admin/product/${deleteProductId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));
      setShowDeleteModal(false);
      setDeleteProductId(null);

      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="p-4 lg:ml-64">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Products</h2>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#d69e64] text-white rounded-2xl hover:bg-[#b9854f]"
        >
          + Add New Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        {isCompact ? (
          /* 📱📱📱 MOBILE + TABLET + NEST HUB */
          <div className="space-y-3">
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : error ? (
              <p className="text-center py-4 text-red-500">{error}</p>
            ) : products.length === 0 ? (
              <p className="text-center py-4">No products found</p>
            ) : (
              products.map((p) => (
                <div key={p._id} className="border rounded-lg p-3 bg-[#fff9f4]">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-[#3f2e20]">{p.name}</h3>
                    <span className="font-medium">₹{p.price}</span>
                  </div>

                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p>
                      <b>Category:</b> {p.category}
                    </p>
                    <p>
                      <b>Stock:</b> {p.stock}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setSelectedProductId(p._id);
                        setShowUpdateModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-yellow-400 rounded text-sm"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => {
                        setDeleteProductId(p._id);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-red-400 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* 💻 DESKTOP ONLY */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-[#f7e8dc] text-[#3f2e20]">
                  <th className="py-4 px-5 text-left font-semibold">Product</th>
                  <th className="py-4 px-5 text-left font-semibold">
                    Category
                  </th>
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
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="py-4 px-5">{p.name}</td>
                      <td>{p.category}</td>
                      <td>₹{p.price}</td>
                      <td>{p.stock}</td>
                      <td>
                        <button
                          onClick={() => {
                            setSelectedProductId(p._id);
                            setShowUpdateModal(true);
                          }}
                          className="px-3 py-2 bg-yellow-400 rounded mr-2"
                        >
                          Update
                        </button>

                        <button
                          onClick={() => {
                            setDeleteProductId(p._id);
                            setShowDeleteModal(true);
                          }}
                          className="px-3 py-2 bg-red-400 text-white rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showModal && (
        <CreateProductModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveProduct}
        />
      )}

      {showUpdateModal && (
        <UpdateProductModal
          productId={selectedProductId}
          onClose={() => setShowUpdateModal(false)}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-md p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Delete Product?</h3>
            <p className="mb-6">
              Are you sure you want to delete this product?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
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
