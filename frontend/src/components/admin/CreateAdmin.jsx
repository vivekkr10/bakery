// src/components/admin/CreateAdmin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateAdmin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");

      await axios.post("http://localhost:5000/api/admin/create", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMsg("Admin created successfully!");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to create admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:ml-64 flex justify-center items-center bg-gradient-to-br from-pink-50 to-orange-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-[#c85a32] mb-6">
          Create Admin
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full p-3 rounded-lg border border-gray-300 
              focus:ring-2 focus:ring-[#dfa26d] outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full p-3 rounded-lg border border-gray-300 
              focus:ring-2 focus:ring-[#dfa26d] outline-none transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full p-3 rounded-lg border border-gray-300 
              focus:ring-2 focus:ring-[#dfa26d] outline-none transition"
            />
          </div>

          {/* Role */}
          <div>
            <label className="font-semibold text-gray-700 mb-1 block">
              Select Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 bg-white
              focus:ring-2 focus:ring-[#dfa26d] outline-none transition"
            >
              <option value="admin">Admin</option>
              <option value="super-admin">Super Admin</option>
            </select>
          </div>

          {/* Message */}
          {msg && (
            <p
              className={`text-center font-semibold ${
                msg.includes("success") ? "text-green-600" : "text-red-600"
              }`}
            >
              {msg}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#dfa26d] text-white font-semibold py-3 rounded-lg 
            shadow-md hover:bg-[#e6b07c] transition-all disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
