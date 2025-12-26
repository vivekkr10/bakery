import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

  // ❌ Not logged in
  if (!token || !adminInfo) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but not admin
  if (!["admin", "super-admin"].includes(adminInfo.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
