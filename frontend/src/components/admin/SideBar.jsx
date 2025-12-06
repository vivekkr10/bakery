import {
  Boxes,
  Home,
  Percent,
  ShoppingBag,
  Truck,
  Menu,
  ChevronLeft,
  User2,
  Users2,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/homePage/logo White.png";

const SideBar = ({ closeSidebar }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const menus = [
    { name: "Dashboard", icon: <Home size={22} />, path: "/admin/dashboard" },
    { name: "Orders", icon: <ShoppingBag size={22} />, path: "/admin/orders" },
    { name: "Products", icon: <Boxes size={22} />, path: "/admin/products" },
    { name: "Delivery", icon: <Truck size={22} />, path: "/admin/delivery" },
    { name: "Offers", icon: <Percent size={22} />, path: "/admin/offers" },
    {
      name: "Create Admin",
      icon: <User2 size={22} />,
      path: "/admin/create-admin",
    },
    {
      name: "All Admins",
      icon: <Users2 size={22} />,
      path: "/admin/all-admins",
    },
    {
      name: "All Users",
      icon: <Users2 size={22} />,
      path: "/admin/all-users",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleClose = () => {
    setMobileOpen(false);
    if (closeSidebar) closeSidebar();
  };

  return (
    <>
      {/* MOBILE HAMBURGER BUTTON - Only show if closeSidebar prop is not provided */}
      {!closeSidebar && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-[#8B5E3C] text-white p-2.5 rounded-lg shadow-md hover:bg-[#6a4a2b] active:scale-95 transition-transform"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* MOBILE BACKDROP */}
      {(mobileOpen || closeSidebar) && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:fixed top-0 left-0 h-full 
          w-56 sm:w-64 
          bg-[#e2bf9d] shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${
            mobileOpen || closeSidebar
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#d7b99b] shrink-0">
          <img src={logo} alt="Logo" className="h-10 sm:h-12 w-auto" />

          {/* Close button only visible on mobile */}
          <button
            onClick={handleClose}
            className="lg:hidden p-1.5 sm:p-2 rounded hover:bg-[#d3a882] active:bg-[#c99d6f] transition-colors"
            aria-label="Close menu"
          >
            <ChevronLeft size={24} className="text-[#6a4a2b]" />
          </button>
        </div>

        {/* MENU LIST */}
        <nav className="flex-1 overflow-y-auto mt-2 sm:mt-4 px-2 space-y-1">
          {menus.map((m) => (
            <Link
              key={m.name}
              to={m.path}
              onClick={handleClose}
              className={`
                flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg 
                font-semibold transition-all active:scale-[0.98]
                ${
                  isActive(m.path)
                    ? "bg-[#8B5E3C] text-white shadow-md"
                    : "text-[#6a4a2b] hover:bg-[#f3dfcf] active:bg-[#e8d0b8]"
                }
              `}
            >
              <span className="shrink-0">{m.icon}</span>
              <span className="text-base sm:text-lg truncate">{m.name}</span>
            </Link>
          ))}
        </nav>

        {/* FOOTER - Bakery Copyright */}
        <div className="mt-auto p-3 sm:p-4 border-t border-[#d7b99b] shrink-0">
          <p className="text-center text-xs sm:text-sm text-[#6a4a2b]">
            © Graphura India Pvt. Ltd.
          </p>
          <p className="text-center text-[10px] sm:text-xs text-[#6a4a2b]/70 mt-1">
            All rights reserved
          </p>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
