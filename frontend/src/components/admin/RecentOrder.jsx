import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RecentOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/admin/orders", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });

        const recent = res.data.orders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        setOrders(recent);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg w-full">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-[#6f482a]">
        Recent Orders
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr className="bg-[#f8e9dd]">
              <th className="py-2 sm:py-3 px-3 sm:px-4 text-gray-700 font-semibold">
                Order ID
              </th>
              <th className="py-2 sm:py-3 px-3 sm:px-4 text-gray-700 font-semibold">
                Customer
              </th>
              <th className="py-2 sm:py-3 px-3 sm:px-4 text-gray-700 font-semibold">
                Amount
              </th>
              <th className="py-2 sm:py-3 px-3 sm:px-4 text-gray-700 font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No recent orders
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o._id}
                  className="hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <td className="py-2 px-3 sm:px-4 text-gray-800 font-medium text-sm sm:text-base">
                    #{o._id.slice(-6).toUpperCase()}
                  </td>

                  <td className="py-2 px-3 sm:px-4 text-gray-700 text-sm sm:text-base">
                    {o.shippingAddress?.name || "Guest"}
                  </td>

                  <td className="py-2 px-3 sm:px-4 text-gray-700 text-sm sm:text-base">
                    ₹{o.totalAmount.toFixed(0)}
                  </td>

                  <td className="py-2 px-3 sm:px-4">
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(
                        o.orderStatus
                      )}`}
                    >
                      {o.orderStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-4 flex justify-center sm:justify-end">
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-[#d69e64] text-white font-semibold rounded-lg shadow hover:bg-[#c17f45] transition text-sm sm:text-base"
          >
            See More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentOrder;
