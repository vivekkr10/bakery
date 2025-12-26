import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import SideBar from "../admin/SideBar";

const DashboardLayout = () => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <SideBar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
