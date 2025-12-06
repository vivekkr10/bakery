import React from "react";

const Delivery = () => {
  const deliveries = [
    {
      id: "DEL101",
      customer: "Amit Sharma",
      phone: "9876543210",
      address: "221B Baker Street, Lucknow",
      status: "Out for Delivery",
    },
    {
      id: "DEL102",
      customer: "Priya Verma",
      phone: "9123456780",
      address: "MG Road, Kanpur",
      status: "Pending",
    },
    {
      id: "DEL103",
      customer: "Rahul Singh",
      phone: "9988776655",
      address: "Civil Lines, Allahabad",
      status: "Delivered",
    },
  ];

  return (
    <div className="p-6 lg:ml-64">
      <h2 className="text-2xl font-bold mb-6 text-[#3f2e20]">
        Delivery Management
      </h2>

      <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#f7e8dc] text-[#3f2e20]">
              <th className="py-3 px-4 text-left font-semibold">Delivery ID</th>
              <th className="py-3 px-4 text-left font-semibold">Customer</th>
              <th className="py-3 px-4 text-left font-semibold">Phone</th>
              <th className="py-3 px-4 text-left font-semibold">Address</th>
              <th className="py-3 px-4 text-left font-semibold">Status</th>
              <th className="py-3 px-4 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50 text-[#3f2e20]">
                <td className="py-3 px-4 whitespace-nowrap">{d.id}</td>
                <td className="py-3 px-4 whitespace-nowrap">{d.customer}</td>
                <td className="py-3 px-4 whitespace-nowrap">{d.phone}</td>
                <td className="py-3 px-4 max-w-xs truncate">{d.address}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      d.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : d.status === "Out for Delivery"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="py-3 px-4 flex flex-wrap gap-2">
                  <button className="px-3 py-1 bg-[#d69e64] text-[#3f2e20] border-[#d9c1aa] rounded-md text-sm hover:bg-[#3f2e20] hover:text-[#f8e9dd]">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Delivery;
