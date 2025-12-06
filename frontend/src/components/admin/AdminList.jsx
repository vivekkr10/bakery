import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await axios.get("http://localhost:5000/api/admin/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (id) => {
    const yes = window.confirm("Are you sure you want to delete this admin?");
    if (!yes) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(`http://localhost:5000/api/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete admin");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-[#6a4a2b] lg:ml-64">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-[#8B5E3C]">
        Admin Accounts
      </h2>

      {loading ? (
        <p className="text-center py-8 text-[#6a4a2b]">Loading...</p>
      ) : admins.length === 0 ? (
        <p className="text-center py-8 text-[#6a4a2b]">No admins found.</p>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="w-full bg-white border border-[#e6e0db] rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-[#fff9f4] transition"
            >
              {/* LEFT SIDE */}
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-[#8B5E3C] truncate">
                  {admin.name}
                </h3>

                <p className="text-sm text-[#6a4a2b] truncate">{admin.email}</p>

                <p className="text-xs text-[#6a4a2b]/70 mt-1">
                  Created: {new Date(admin.createdAt).toLocaleDateString()}
                </p>

                {/* ROLE BADGE */}
                <p className="text-xs mt-1 font-semibold">
                  Role:{" "}
                  <span
                    className={`${
                      admin.role === "super-admin"
                        ? "text-purple-700"
                        : "text-[#d69e64]"
                    } font-bold`}
                  >
                    {admin.role}
                  </span>
                </p>
              </div>

              {/* RIGHT SIDE */}
              <div>
                {admin.role !== "super-admin" ? (
                  <button
                    onClick={() => deleteAdmin(admin._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm sm:text-base font-medium shadow"
                  >
                    Delete
                  </button>
                ) : (
                  <span className="px-4 py-2 rounded-lg bg-gray-200 text-gray-500 text-sm shadow">
                    Protected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminList;
