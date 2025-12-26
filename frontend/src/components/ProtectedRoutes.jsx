import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children, adminOnly = false }) => {
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");

  // 🔐 ADMIN ROUTES
  if (adminOnly) {
    if (!adminToken) {
      return <Navigate to="/admin-login" replace />;
    }
    return children;
  }

  // 🔐 USER ROUTES
  if (!userToken) {
    // 🔥 ADMIN logged in but accessing user page
    if (adminToken) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
