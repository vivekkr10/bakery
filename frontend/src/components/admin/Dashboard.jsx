import React from "react";
import StatsCards from "./StatsCards";
import SalesChart from "./SalesChart";
import OrdersPieChart from "./OrdersPieChart";
import RecentOrder from "./RecentOrder";
import Topbar from "./Topbar";

const Dashboard = () => {
  return (
    <div className="flex lg:ml-64 flex-col min-h-screen bg-[#fff9f4]">
      {/* TOP NAV - Only visible on desktop */}
      <Topbar />

      {/* PAGE CONTENT */}
      <div className="p-4 sm:p-6 lg:p-8 pt-2 sm:pt-16 lg:pt-4">
        {/* STATS CARDS */}
        <StatsCards />

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <SalesChart />
          <OrdersPieChart />
        </div>

        {/* RECENT ORDERS */}
        <div className="mt-4 sm:mt-6">
          <RecentOrder />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
