import React, { useEffect, useState } from "react";
import axios from "axios";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // block | unblock | delete
  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem("adminToken");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open confirmation popup
  const openModal = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  // Perform Block / Unblock / Delete
  const confirmAction = async () => {
    if (!selectedUser || !modalAction) return;

    try {
      if (modalAction === "delete") {
        await axios.delete(
          `http://localhost:5000/api/admin/user/${selectedUser._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      } else if (modalAction === "block" || modalAction === "unblock") {
        const shouldBlock = modalAction === "block";

        await axios.patch(
          `http://localhost:5000/api/admin/user/block/${selectedUser._id}`,
          { blocked: shouldBlock },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers((prev) =>
          prev.map((u) =>
            u._id === selectedUser._id ? { ...u, isBlocked: shouldBlock } : u
          )
        );
      }

      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Action failed:", err);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="p-6 lg:ml-64">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">All Users</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex justify-between items-center"
            >
              {/* USER DETAILS */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>

                {user.phone && (
                  <p className="text-sm text-gray-600">📞 {user.phone}</p>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>

                {user.isBlocked && (
                  <span className="text-red-500 text-xs font-semibold">
                    BLOCKED
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    openModal(user, user.isBlocked ? "unblock" : "block")
                  }
                  className={`px-4 py-2 rounded-lg font-medium text-white transition ${
                    user.isBlocked
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>

                <button
                  onClick={() => openModal(user, "delete")}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRMATION POPUP */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[90%] max-w-md p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {modalAction === "delete"
                ? "Delete User?"
                : modalAction === "block"
                ? "Block User?"
                : "Unblock User?"}
            </h3>

            <p className="text-gray-600 mb-6">
              {modalAction === "delete"
                ? "Are you sure you want to delete this user? This action is permanent."
                : modalAction === "block"
                ? "Are you sure you want to block this user?"
                : "Are you sure you want to unblock this user?"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-lg transition ${
                  modalAction === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : modalAction === "block"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {modalAction === "delete"
                  ? "Confirm Delete"
                  : modalAction === "block"
                  ? "Confirm Block"
                  : "Confirm Unblock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
