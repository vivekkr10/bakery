import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingBag,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { getImageUrl } from "../../utils/getImageUrl";

export default function Profile() {
  // const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userType, setUserType] = useState(null); // 'user' or 'admin' or null
  const [sessionExpired, setSessionExpired] = useState(false);

  const navigate = useNavigate();

  // Check token validity and user type
  const checkTokenValidity = () => {
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");

    // Check if tokens exist and are not expired
    if (adminToken) {
      try {
        const payload = JSON.parse(atob(adminToken.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          return { valid: true, type: "admin", token: adminToken };
        }
      } catch (e) {
        console.error("Invalid admin token:", e);
      }
    }

    if (userToken) {
      try {
        const payload = JSON.parse(atob(userToken.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          return { valid: true, type: "user", token: userToken };
        }
      } catch (e) {
        console.error("Invalid user token:", e);
      }
    }

    return { valid: false, type: null, token: null };
  };

  // Clear all auth data
  const clearAuthData = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("storage"));
  };

  // Fetch user/admin data with retry logic
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setSessionExpired(false);

      const tokenInfo = checkTokenValidity();

      if (!tokenInfo.valid) {
        toast.error("Session expired. Please login again.");
        clearAuthData();
        setSessionExpired(true);
        setLoading(false);
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      setUserType(tokenInfo.type);

      const endpoint =
        tokenInfo.type === "admin" ? "/api/admin/me" : "/api/auth/me";

      try {
        const res = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${tokenInfo.token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 10000, // 10 second timeout
        });

        // Handle different response structures
        if (tokenInfo.type === "admin") {
          setUser(res.data.admin || res.data);
        } else {
          setUser(res.data.user || res.data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);

        // Handle different error types
        if (err.code === "ECONNABORTED") {
          toast.error("Request timeout. Please try again.");
        } else if (err.response) {
          // Server responded with error
          if (err.response.status === 401 || err.response.status === 403) {
            toast.error("Session expired. Please login again.");
            clearAuthData();
            setSessionExpired(true);
            setTimeout(() => navigate("/login"), 1500);
          } else {
            toast.error(err.response.data?.message || "Failed to load profile");
          }
        } else if (err.request) {
          // No response received
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  // Fetch orders (only for regular users)
  useEffect(() => {
    const fetchOrders = async () => {
      // Don't fetch orders if not a regular user or session expired
      if (userType !== "user" || sessionExpired) {
        setOrdersLoading(false);
        return;
      }

      const token = localStorage.getItem("userToken");

      if (!token) {
        setOrdersLoading(false);
        return;
      }

      try {
        const response = await axios.get("/api/orders/my", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          timeout: 10000,
        });

        if (response.data.success) {
          setOrders(response.data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response?.status === 401) {
          // Token expired while fetching orders
          clearAuthData();
          setSessionExpired(true);
          toast.error("Session expired. Please login again.");
          setTimeout(() => navigate("/login"), 1500);
        }
      } finally {
        setOrdersLoading(false);
      }
    };

    if (userType === "user" && !sessionExpired) {
      fetchOrders();
    } else {
      setOrdersLoading(false);
    }
  }, [userType, sessionExpired, navigate]);

  // DELETE ACCOUNT (for users only)
  const deleteAccount = async () => {
    if (userType === "admin") {
      toast.error("Admins cannot delete account from here.");
      return;
    }

    const token = localStorage.getItem("userToken");

    try {
      await axios.delete("/api/user/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });

      clearAuthData();
      toast.success("Account deleted successfully!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      toast.error("Failed to delete account.");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: <FaCheckCircle className="mr-1" />,
          label: "Delivered",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: <FaTimesCircle className="mr-1" />,
          label: "Cancelled",
        };
      case "out-for-delivery":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          icon: <FaTruck className="mr-1" />,
          label: "Out for Delivery",
        };
      case "confirmed":
      case "preparing":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          icon: <FaClock className="mr-1" />,
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          icon: <FaClock className="mr-1" />,
          label: "Processing",
        };
    }
  };

  // CANCEL ORDER FUNCTION (users only)
  const handleCancelOrder = async (orderId) => {
    if (sessionExpired) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const token = localStorage.getItem("userToken");

    if (!token) {
      toast.error("Please login again");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!isConfirmed) return;

    try {
      const response = await axios.put(
        `/api/orders/cancel/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully!");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, orderStatus: "cancelled" }
              : order
          )
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        clearAuthData();
        setSessionExpired(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(error.response?.data?.message || "Failed to cancel order");
      }
    }
  };

  // Get payment status badge
  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "Paid",
        };
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: "Pending",
        };
      case "failed":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Failed",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          label: status || "Unknown",
        };
    }
  };

  // Logout function for both user and admin
  const handleLogout = async () => {
    try {
      // Clear local storage first
      clearAuthData();

      // Try to call logout API (optional)
      try {
        await axios.post(
          "/api/auth/logout",
          {},
          {
            timeout: 5000,
          }
        );
      } catch (apiError) {
        // API call failed, but we've already cleared local storage
        console.log("Logout API call optional");
      }

      toast.success("Logged out successfully!");
      setTimeout(() => {
        window.location.href = "/home";
      }, 1000);
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Logout failed, try again!");
    }
  };

  // Handle refresh orders
  const handleRefreshOrders = async () => {
    if (sessionExpired || userType !== "user") return;

    const token = localStorage.getItem("userToken");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    setOrdersLoading(true);
    try {
      const response = await axios.get("/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
        toast.success("Orders refreshed!");
      }
    } catch (error) {
      console.error("Refresh error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        clearAuthData();
        setSessionExpired(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error("Failed to refresh orders");
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-[#f8f7f6]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#dfa26d] mb-4"></div>
        <p className="text-lg text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  // Session expired state
  if (sessionExpired) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-[#f8f7f6] ">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center ">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Session Expired
          </h2>
          <p className="text-gray-600 mb-6">
            Your session has expired. Please login again.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-[#dfa26d] text-white rounded-lg hover:bg-[#c98f5f] transition font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If no user data loaded
  if (!user) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-[#f8f7f6]">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Profile Data
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load profile information.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-[#dfa26d] text-white rounded-lg hover:bg-[#c98f5f] transition font-semibold"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback Initial Letter
  const initial = user?.username
    ? user.username.charAt(0).toUpperCase()
    : user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  const hasProfilePic = Boolean(user?.profilePicture);

  return (
    <div className="font-display bg-[#f8f7f6] min-h-screen text-[#181411] px-4 py-10 ">
      <div className="mx-auto w-full max-w-7xl mt-15">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* SIDEBAR */}
          <aside className="w-full md:w-64 lg:w-72 h-[300px]">
            <div className="sticky top-10 flex h-full min-h-[650px] flex-col justify-between rounded-xl bg-white p-4 shadow-sm">
              {/* USER MINI HEADER */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {/* PROFILE PICTURE OR INITIAL */}
                  {hasProfilePic ? (
                    <div
                      className="bg-center bg-cover bg-no-repeat rounded-full size-12 border"
                      style={{
                        backgroundImage: `url("${getImageUrl(
                          user.profilePicture
                        )}")`,
                      }}
                    ></div>
                  ) : (
                    <div className="size-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold">
                      {initial}
                    </div>
                  )}

                  <div>
                    <h1 className="text-base font-bold">
                      {user?.name || "User"}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {user?.email}
                      {userType === "admin" && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* MENU */}
                <div className="mt-4 flex flex-col gap-2">
                  <button className="flex items-center gap-3 rounded-lg bg-orange-200/40 text-orange-600 font-bold px-3 py-2">
                    <i className="bx bx-user"></i>
                    My Profile
                  </button>

                  {userType === "user" && (
                    <>
                      <a
                        href="#order-history"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-orange-200/30"
                      >
                        <i className="bx bx-history"></i>
                        Order History
                      </a>
                    </>
                  )}

                  {/* ADMIN DASHBOARD LINK (ADMIN ONLY) */}
                  {userType === "admin" && (
                    <button
                      onClick={() => navigate("/admin/dashboard")}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-orange-200/30 text-purple-600 font-semibold"
                    >
                      <i className="bx bx-dashboard"></i>
                      Admin Dashboard
                    </button>
                  )}
                </div>
              </div>

              {/* LOGOUT AND DELETE ACCOUNT*/}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-[#d78f52] text-white rounded-lg hover:bg-[#c97f45] transition flex items-center justify-center gap-2"
                >
                  <i className="bx bx-log-out"></i>
                  Logout
                </button>

                {userType === "user" && (
                  <button
                    onClick={() => setShowDeletePopup(true)}
                    className="w-full bg-red-600 text-white py-2 px-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <i className="bx bx-trash"></i>
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <section className="flex-1 flex flex-col gap-8">
            {/* PROFILE MAIN CARD */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              {/* LARGE PROFILE IMAGE OR INITIAL */}
              <div className="flex items-center gap-6 mb-6">
                {hasProfilePic ? (
                  <img
                    src={getImageUrl(user.profilePicture)}
                    className="w-28 h-28 rounded-full object-cover border"
                    alt="profile"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-orange-500 text-white flex items-center justify-center text-4xl font-bold">
                    {initial}
                  </div>
                )}

                <div>
                  <h1 className="text-xl font-semibold">{user?.name}</h1>
                  <p className="text-gray-500">
                    @{user?.username || user?.email?.split("@")[0]}
                  </p>
                  {userType === "admin" && user?.role && (
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1 ${
                        user.role === "super-admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </div>
              </div>

              {/* PERSONAL INFO */}
              <h2 className="text-2xl font-bold mb-1">My Profile</h2>
              <p className="text-gray-500 mb-6">
                Your personal information is shown below.
              </p>

              {/* Profile Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Full Name</p>
                  <p className="text-base font-semibold mt-1">
                    {user?.name || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-base font-semibold mt-1">
                    {user?.email || "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Phone Number
                  </p>
                  <p className="text-base font-semibold mt-1">
                    {user?.phone || "Not Added"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {userType === "user" ? "Delivery Address" : "Role"}
                  </p>
                  <p className="text-base font-semibold mt-1">
                    {userType === "user"
                      ? user?.address
                        ? `${user.address.street || ""}, ${
                            user.address.city || ""
                          }, ${user.address.state || ""}, ${
                            user.address.pincode || ""
                          }`
                        : "Not Added"
                      : user?.role || "Admin"}
                  </p>
                </div>
              </div>

              {/* EDIT PROFILE BUTTON (FOR BOTH USER AND ADMIN) */}
              <div className="flex justify-end mt-6">
                <Link
                  to={
                    userType === "admin"
                      ? "/admin/edit-profile"
                      : "/edit-profile"
                  }
                  state={{ userType }}
                >
                  <button
                    className="px-6 py-2 rounded-lg text-white font-semibold bg-[#dfa26d] hover:bg-[#c98f5f] transition flex items-center gap-2"
                    type="button"
                  >
                    <i className="bx bx-edit"></i>
                    Edit Profile
                  </button>
                </Link>
              </div>
            </div>

            {/* ORDER HISTORY (ONLY FOR USERS) */}
            {userType === "user" && (
              <div
                id="order-history"
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Order History</h2>
                    <p className="text-gray-500">
                      Review your past purchases with us.
                    </p>
                  </div>
                  <button
                    onClick={handleRefreshOrders}
                    disabled={ordersLoading || sessionExpired}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <i
                      className={`bx ${
                        ordersLoading
                          ? "bx-loader-alt animate-spin"
                          : "bx-refresh"
                      }`}
                    ></i>
                    Refresh Orders
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#dda56a] mb-4"></div>
                    <p className="text-gray-500">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Orders Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      You haven't placed any orders yet.
                    </p>
                    <Link to="/menu">
                      <button className="px-6 py-3 bg-[#dda56a] text-white rounded-lg hover:bg-[#c8955f] transition font-semibold">
                        Start Shopping
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const statusBadge = getStatusBadge(order.orderStatus);
                      const paymentBadge = getPaymentBadge(order.paymentStatus);

                      return (
                        <div
                          key={order._id}
                          className="border rounded-xl p-5 hover:shadow-md transition-shadow"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <FaShoppingBag className="text-[#dda56a]" />
                                <h3 className="font-bold text-lg">
                                  Order #
                                  {order._id
                                    ?.toString()
                                    .slice(-8)
                                    .toUpperCase() || "N/A"}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-500">
                                Placed on {formatDate(order.createdAt)}
                              </p>
                              {order.deliveredAt && (
                                <p className="text-sm text-gray-500">
                                  Delivered on {formatDate(order.deliveredAt)}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusBadge.bg} ${statusBadge.text}`}
                              >
                                {statusBadge.icon} {statusBadge.label}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${paymentBadge.bg} ${paymentBadge.text}`}
                              >
                                {paymentBadge.label}
                              </span>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                              {order.items?.length || 0} item
                              {(order.items?.length || 0) > 1 ? "s" : ""}:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(order.items || [])
                                .slice(0, 3)
                                .map((item, index) => {
                                  const isCustomCake =
                                    item.isCustomCake ||
                                    item.category === "custom" ||
                                    item.name?.toLowerCase().includes("custom");

                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                                    >
                                      <img
                                        src={
                                          item.img || item.image || "/cake5.jpg"
                                        }
                                        alt={item.name}
                                        className="w-10 h-10 rounded object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = isCustomCake
                                            ? "/Image/custom-cake-default.jpg"
                                            : "/cake5.jpg";
                                        }}
                                      />
                                      <div>
                                        <p className="text-sm font-medium">
                                          {item.name || "Unnamed Item"}
                                          {isCustomCake && (
                                            <span className="ml-1 text-xs text-rose-500 font-medium">
                                              (Custom)
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {item.qty || 1} × ₹{item.price || 0}
                                          {isCustomCake && item.message && (
                                            <span className="block truncate">
                                              "{item.message}"
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              {(order.items?.length || 0) > 3 && (
                                <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center">
                                  <span className="text-sm text-gray-600">
                                    +{(order.items?.length || 0) - 3} more items
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t">
                            <div>
                              <p className="text-sm text-gray-600">
                                Payment:{" "}
                                {order.paymentMethod === "cod"
                                  ? "Cash on Delivery"
                                  : order.paymentMethod === "razorpay"
                                  ? "Online Payment"
                                  : order.paymentMethod || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Delivery to:{" "}
                                {order.shippingAddress?.city || "Unknown"},{" "}
                                {order.shippingAddress?.state || "Unknown"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-bold text-[#dda56a]">
                                ₹{(order.totalAmount || 0).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                Includes ₹{(order.tax || 0).toFixed(2)} tax + ₹
                                {order.deliveryCharge || 0} delivery
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 mt-4">
                            {/* <Link to={`/order-details/${order._id}`}>
                              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                                View Details
                              </button>
                            </Link> */}

                            {order.orderStatus === "delivered" && (
                              <button className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                                Rate Order
                              </button>
                            )}

                            {["created", "confirmed", "preparing"].includes(
                              order.orderStatus
                            ) && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Order Statistics */}
                {orders.length > 0 && (
                  <div className="mt-8 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-sm text-blue-600 font-medium">
                        Total Orders
                      </p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-sm text-green-600 font-medium">
                        Total Spent
                      </p>
                      <p className="text-2xl font-bold">
                        ₹
                        {orders
                          .reduce(
                            (sum, order) => sum + (order.totalAmount || 0),
                            0
                          )
                          .toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-purple-600 font-medium">
                        Avg. Order Value
                      </p>
                      <p className="text-2xl font-bold">
                        ₹
                        {orders.length > 0
                          ? (
                              orders.reduce(
                                (sum, order) => sum + (order.totalAmount || 0),
                                0
                              ) / orders.length
                            ).toFixed(2)
                          : "0.00"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN STATISTICS SECTION (FOR ADMINS) */}
            {userType === "admin" && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-1">Admin Statistics</h2>
                <p className="text-gray-500 mb-6">
                  Overview of your admin activities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Admin Since
                        </p>
                        <p className="text-2xl font-bold mt-2">
                          {user?.createdAt
                            ? formatDate(user.createdAt)
                            : "Recently"}
                        </p>
                      </div>
                      <div className="text-3xl text-blue-500">
                        <i className="bx bx-calendar"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">
                          Access Level
                        </p>
                        <p className="text-2xl font-bold mt-2 capitalize">
                          {user?.role || "Admin"}
                        </p>
                      </div>
                      <div className="text-3xl text-green-500">
                        <i className="bx bx-shield"></i>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">
                          Status
                        </p>
                        <p className="text-2xl font-bold mt-2">Active</p>
                      </div>
                      <div className="text-3xl text-purple-500">
                        <i className="bx bx-check-circle"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* DELETE ACCOUNT POPUP */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-2">Delete Account?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete your account? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
