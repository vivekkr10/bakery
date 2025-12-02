import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // if (!token) return (window.location.href = "/login");

    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Loading profile...
      </div>
    );

  return (
    <div className="profile">
      <div className="max-w-4xl mx-auto p-6 py-10">
        <div className="bg-white shadow-xl rounded-2xl p-8">

          <h2 className="text-3xl font-bold mb-6 text-gray-900">My Profile</h2>

          {/* Profile Image */}
          <div className="flex items-center gap-6 mb-8">
            <img
              src={
                user?.profilePicture ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-28 h-28 rounded-full object-cover border"
              alt="profile"
            />

            <div>
              <h1 className="text-xl font-semibold">{user?.name}</h1>
              <p className="text-gray-500">@{user?.username}</p>
            </div>
          </div>

          {/* Information */}
          <div className="space-y-3 text-gray-700">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phone || "Not Added"}</p>
            <p><strong>Address:</strong> 
              {user?.address?.street || ""} {user?.address?.city || ""} {user?.address?.state || ""} {user?.address?.pincode || ""}
            </p>
          </div>

          {/* Edit Button */}
          <NavLink
            to="/edit-profile"
            className="mt-8 block text-center bg-yellow-600 text-white py-3 rounded-lg text-lg font-medium"
          >
            Edit Profile →
          </NavLink>

          {/* Admin Login */}
          <NavLink
            to=""
            className="mt-8 block text-center bg-yellow-600 text-white py-3 rounded-lg text-lg font-medium"
          >
            Admin Login →
          </NavLink>

        </div>
      </div>
    </div>
  );
}
