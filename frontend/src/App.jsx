import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ---------- LAYOUTS ---------- */
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

/* ---------- PROTECTED ---------- */
import ProtectedRoutes from "./components/ProtectedRoutes";
import ProtectedSuperAdmin from "./components/admin/ProtectedSuperAdmin";

/* ---------- COMMON ---------- */
import ScrollToTop from "./components/ScrollToTop";

/* ---------- PUBLIC ---------- */
import Homepage from "./components/homePage/Homepage";
import About from "./components/about/About";
import ContactUs from "./components/ContactUs";

/* ---------- USER AUTH ---------- */
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import VerifyOTP from "./components/auth/VerifyOTP";
import SetUsername from "./components/auth/SetUsername";
import ForgetPassword from "./components/auth/ForgetPassword";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyForgetPasswordOTP from "./components/auth/VerifyForgetPasswordOTP";

/* ---------- USER ---------- */
import Profile from "./components/userProfile/Profile";
import EditProfile from "./components/userProfile/EditProfile";
import AllProducts from "./components/user/AllProducts";
import ProductDetails from "./components/user/ProductDetails";
import Cart from "./components/homePage/Cart";
import OrderNow from "./components/homePage/OrderNow";
import OrderSuccess from "./components/homePage/OrderSuccess";
import FilterPage from "./components/homePage/Filter";
import CustomCakeBuilder from "./components/homePage/CustomCakeBuilder";

/* ---------- ADMIN ---------- */
import AdminLogin from "./components/admin/AdminLogin";
import DashboardHome from "./components/admin/Dashboard";
import Products from "./components/admin/Products";
import CreateProduct from "./components/admin/CreateProduct";
import UpdateProduct from "./components/admin/UpdateProduct";
import Orders from "./components/admin/Orders";
import OffersPage from "./components/admin/OffersPage";
import Delivery from "./components/admin/Delivery";
import Customers from "./components/admin/CustomerDetail";
import CreateAdmin from "./components/admin/CreateAdmin";
import AdminList from "./components/admin/AdminList";
import AllUsers from "./components/admin/AllUsers";
import SuperAdminRegister from "./components/admin/SuperAdminRegister";

export default function App() {
  return (
   <>
      <ScrollToTop />

      <Toaster position="top-right" />

      <Routes>
        {/* ================= DEFAULT ================= */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* ================= PUBLIC ================= */}
        <Route
          path="/home"
          element={
            <MainLayout>
              <Homepage />
            </MainLayout>
          }
        />

        <Route
          path="/about"
          element={
            <MainLayout>
              <About />
            </MainLayout>
          }
        />

        <Route
          path="/contact-us"
          element={
            <MainLayout>
              <ContactUs />
            </MainLayout>
          }
        />

        {/* ================= USER AUTH ================= */}
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/verify-otp" element={<AuthLayout><VerifyOTP /></AuthLayout>} />
        <Route path="/set-username" element={<AuthLayout><SetUsername /></AuthLayout>} />
        <Route path="/forget-password" element={<AuthLayout><ForgetPassword /></AuthLayout>} />
        <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
        <Route path="/otp-verify" element={<AuthLayout><VerifyForgetPasswordOTP /></AuthLayout>} />

        {/* ================= USER ================= */}
        <Route
          path="/profile"
          element={
            <ProtectedRoutes>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoutes>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoutes>
              <MainLayout>
                <EditProfile />
              </MainLayout>
            </ProtectedRoutes>
          }
        />

        <Route path="/menu" element={<MainLayout><FilterPage /></MainLayout>} />
        <Route path="/products" element={<MainLayout><AllProducts /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductDetails /></MainLayout>} />
        <Route path="/customize" element={<MainLayout><CustomCakeBuilder /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />

        <Route
          path="/order"
          element={
            <ProtectedRoutes>
              <MainLayout>
                <OrderNow />
              </MainLayout>
            </ProtectedRoutes>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoutes>
              <MainLayout>
                <OrderSuccess />
              </MainLayout>
            </ProtectedRoutes>
          }
        />

        {/* ================= ADMIN LOGIN ================= */}
        <Route path="/admin-login" element={<AuthLayout><AdminLogin /></AuthLayout>} />

        {/* ================= ADMIN DASHBOARD (PROTECTED) ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoutes adminOnly>
              <DashboardLayout />
            </ProtectedRoutes>
          }
        >
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="products/update/:id" element={<UpdateProduct />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="delivery" element={<Delivery />} />
          <Route path="customer-detail" element={<Customers />} />
          <Route path="all-users" element={<AllUsers />} />

          {/* ===== SUPER ADMIN ONLY ===== */}
          <Route
            path="create-admin"
            element={
              <ProtectedSuperAdmin>
                <CreateAdmin />
              </ProtectedSuperAdmin>
            }
          />

          <Route
            path="all-admins"
            element={
              <ProtectedSuperAdmin>
                <AdminList />
              </ProtectedSuperAdmin>
            }
          />
        </Route>

        {/* ================= SUPER ADMIN REGISTER ================= */}
        <Route
          path="/super-admin/register"
          element={<AuthLayout><SuperAdminRegister /></AuthLayout>}
        />

        {/* ================= 404 ================= */}
        <Route
          path="*"
          element={
            <MainLayout>
              <h1 className="text-3xl text-center mt-20">
                404 — Page Not Found
              </h1>
            </MainLayout>
          }
        />
      </Routes>
  </>
  );
}
