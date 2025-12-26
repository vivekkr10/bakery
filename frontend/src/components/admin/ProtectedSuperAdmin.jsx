import { Navigate } from "react-router-dom";

const ProtectedSuperAdmin = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

  if (!adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  if (adminInfo?.role !== "super-admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedSuperAdmin;
