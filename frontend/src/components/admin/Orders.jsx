import React, { useState } from "react";

const Orders = () => {
  const orders = [
    {
      id: "ORD123",
      customer: "Amit Sharma",
      total: 850,
      status: "Pending",
      date: "03-12-2025",
    },
    {
      id: "ORD124",
      customer: "Priya Verma",
      total: 1200,
      status: "In-Progress",
      date: "03-12-2025",
    },
    {
      id: "ORD125",
      customer: "Rohit Singh",
      total: 650,
      status: "Completed",
      date: "02-12-2025",
    },
    {
      id: "ORD126",
      customer: "Neha Gupta",
      total: 1450,
      status: "Cancelled",
      date: "01-12-2025",
    },
    {
      id: "ORD127",
      customer: "Rahul Jain",
      total: 980,
      status: "Completed",
      date: "30-11-2025",
    },
  ];

  const [filter, setFilter] = useState("All");

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "In-Progress": "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  const filteredOrders =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-4 sm:p-6 lg:p-8 lg:ml-64">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8 text-[#8B5E3C]">
        Orders Management
      </h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8 flex-wrap">
        {["All", "Pending", "In-Progress", "Completed", "Cancelled"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`
                            px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                            shadow-sm border
                            ${
                              filter === s
                                ? "bg-[#8B5E3C] text-white border-transparent"
                                : "bg-white text-[#6a4a2b] border-[#e6e0db] hover:bg-[#f7e8dc]"
                            }
                        `}
            >
              {s}
            </button>
          )
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-[#e6e0db]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#f7e8dc]">
                <th className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5 text-left text-xs sm:text-sm font-semibold text-[#6a4a2b]">
                  Order ID
                </th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5 text-left text-xs sm:text-sm font-semibold text-[#6a4a2b]">
                  Customer
                </th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5 text-left text-xs sm:text-sm font-semibold text-[#6a4a2b]">
                  Total Amount
                </th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5 text-left text-xs sm:text-sm font-semibold text-[#6a4a2b]">
                  Status
                </th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5 text-left text-xs sm:text-sm font-semibold text-[#6a4a2b]">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((o, index) => (
                <tr
                  key={index}
                  className="border-b border-[#e6e0db] last:border-none hover:bg-[#fff9f4] transition-all text-[#6a4a2b]"
                >
                  <td className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm font-semibold">
                    {o.id}
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm">
                    {o.customer}
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm font-medium">
                    ₹{o.total}
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5">
                    <span
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                        statusColors[o.status]
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm">
                    {o.date}
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 sm:py-10 text-[#6a4a2b] text-sm sm:text-base"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
