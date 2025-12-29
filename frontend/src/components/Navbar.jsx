import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import logo from "../assets/homePage/logo White.png";
import { FaShoppingCart } from "react-icons/fa";
import { getImageUrl } from "../utils/getImageUrl";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const cart = useSelector((state) => state.cart || { items: [] });
  const cartCount = cart.items?.length || 0;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/product", {
          params: { limit: 100 },
        });

        if (response.data && response.data.success) {
          const uniqueCategories = [
            ...new Set(response.data.products.map((p) => p.category)),
          ];
          setCategories(uniqueCategories.filter((c) => c && c.trim() !== ""));
        }
      } catch {
        setCategories(["Classic Cakes", "Premium Cakes", "Donuts", "Cookies"]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Sync user
  useEffect(() => {
    const syncUser = async () => {
      try {
        const storedUser = localStorage.getItem("userInfo");
        const storedAdmin = localStorage.getItem("adminInfo");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (storedAdmin) {
          const admin = JSON.parse(storedAdmin);
          setUser({
            id: admin.id,
            username: "Admin",
            email: admin.email,
            role: admin.role,
            profilePicture: "", // ya koi admin avatar
          });
        } else {
          setUser(null);
        }
      } catch {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        setUser(null);
      }
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  // MENU ITEMS (layout like old navbar)
  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Custom Cake", path: "/customize" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact-us" },
  ];

  return (
    <nav className="fixed left-1/2 -translate-x-1/2 w-[100%] lg:w-[100%] z-50">
      <div
        className="bg-[#6f482a]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]
        border border-white/20 px-5 sm:px-8 md:px-10 py-3 
        flex items-center justify-between transition-all"
      >
        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="logo"
            className="h-10 sm:h-12 drop-shadow-md transition"
          />
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden xl:flex items-center space-x-8 text-white font-semibold">
          {menuItems.map((item) =>
            item.dropdown ? (
              <li key={item.name} className="relative group cursor-pointer">
                <span className="flex items-center hover:text-[#d78f52] transition">
                  {item.name}
                  <ChevronDown
                    size={16}
                    className="ml-1 group-hover:rotate-180 transition-transform duration-300"
                  />
                </span>

                <div className="absolute left-0 right-0 top-full h-4"></div>

                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-48
                  bg-white/95 backdrop-blur-md shadow-xl rounded-xl py-2 mt-3
                  opacity-0 scale-95 pointer-events-none
                  group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                  transition-all duration-300 ease-out"
                >
                  {loading ? (
                    <div className="px-4 py-2 text-sm text-[#8b5e3c]">
                      Loading...
                    </div>
                  ) : (
                    item.dropdown.map((d, index) => (
                      <Link
                        key={index}
                        to={d.path}
                        className="block px-4 py-2 text-sm text-[#8b5e3c]
                        hover:bg-[#f8e9dd] hover:text-[#c57b41] transition"
                        onClick={() => setOpen(false)}
                      >
                        {d.label}
                      </Link>
                    ))
                  )}
                </div>
              </li>
            ) : (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="hover:text-[#d78f52] transition"
                >
                  {item.name}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* DESKTOP RIGHT SIDE BUTTONS */}
        <div className="hidden xl:flex items-center gap-5">
          <Link to="/order">
            <button
              className="px-6 py-2 rounded-full bg-white 
              text-[#8b5e3c] font-semibold shadow-lg hover:scale-105 transition border border-[#6f482a]"
            >
              Order
            </button>
          </Link>

          {user ? (
            <div className="flex items-center gap-5">
              {/* CART */}
              <Link to="/cart">
                <div className="relative">
                  <FaShoppingCart
                    size={26}
                    className="text-white hover:text-[#f3d2ae] transition"
                  />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                      w-5 h-5 flex items-center justify-center rounded-full"
                    >
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* PROFILE */}
              <Link to="/profile">
                <div className="w-10 h-10 rounded-full overflow-hidden hover:scale-110 transition">
                  {user?.profilePicture ? (
                    <img
                      src={getImageUrl(user.profilePicture)}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#d78f52] text-white flex items-center justify-center text-lg font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ) : (
            <Link to="/login">
              <button
                className="px-6 py-2 rounded-full bg-white 
                text-[#8b5e3c] font-semibold shadow-lg hover:scale-105 transition border border-[#6f482a]"
              >
                Login
              </button>
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button className="xl:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`xl:hidden bg-white/90 backdrop-blur-xl mt-3 rounded-2xl shadow-xl overflow-hidden 
        transition-all duration-500 ${open ? "max-h-[600px] py-4" : "max-h-0"}`}
      >
        <ul className="flex flex-col space-y-4 px-6 text-[#8b5e3c] font-semibold">
          {menuItems.map((item) =>
            item.dropdown ? (
              <details key={item.name} className="group">
                <summary className="cursor-pointer flex justify-between items-center">
                  {item.name}
                </summary>

                <div className="mt-2 flex flex-col space-y-2 pl-3 border-l">
                  {item.dropdown.map((d, index) => (
                    <Link
                      key={index}
                      to={d.path}
                      onClick={() => setOpen(false)}
                      className="hover:text-[#c57b41] transition"
                    >
                      {d.label}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setOpen(false)}
                className="hover:text-[#c57b41] transition"
              >
                {item.name}
              </Link>
            )
          )}

          {/* MOBILE AUTH */}
          {!user ? (
            <Link to="/login" onClick={() => setOpen(false)}>
              <button
                className="w-full px-6 py-2 rounded-full bg-[#d78f50] text-white font-semibold shadow-lg  hover:bg-[#cc8448] transition-colors duration-200
"
              >
                Login
              </button>
            </Link>
          ) : (
            <div className="flex items-center gap-5">
              {/* CART */}
              <Link to="/cart">
                <div className="relative">
                  <FaShoppingCart size={26} className="text-[#8b5e3c]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* PROFILE */}
              <Link to="/profile">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={getImageUrl(user.profilePicture)}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#d78f52] text-white flex items-center justify-center text-lg font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
