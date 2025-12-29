import React from "react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const SalesChart = () => {
  const data = [
    { month: "Jan", sales: 9000 },
    { month: "Feb", sales: 12000 },
    { month: "Mar", sales: 15000 },
    { month: "April", sales: 12000 },
    { month: "May", sales: 18000 },
    { month: "June", sales: 21000 },
    { month: "July", sales: 25000 },
    { month: "Aug", sales: 20000 },
    { month: "Sept", sales: 25000 },
    { month: "Oct", sales: 28000 },
    { month: "Nov", sales: 30000 },
    { month: "Dec", sales: 0 },
  ];

  return (
    <div className="bg-[#fff9f4] p-4 rounded-xl shadow w-full overflow-hidden">
      <h3 className="text-sm sm:text-lg font-semibold mb-2 text-[#6f482a] text-center sm:text-left">
        Monthly Sales
      </h3>

      <div className="w-full h-[200px] sm:h-[260px] overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#d69e64"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
