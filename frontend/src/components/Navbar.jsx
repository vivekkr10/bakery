import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/homePage/logo White.png";
import { FaShoppingCart } from "react-icons/fa";
import { HashLink } from "react-router-hash-link";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncUserFromStorageOrAPI = async () => {
      try {
        const stored = localStorage.getItem("userInfo");

        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          const token = localStorage.getItem("userToken");

          if (!token) {
            setUser(null);
          } else {
            const res = await axios.get("http://localhost:5000/api/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
            });

            const u = res.data.user || res.data;

            const cleanedUser = {
              id: u.id || u._id,
              username: u.username,
              email: u.email,
              profilePicture: u.profilePicture || "",
            };

            setUser(cleanedUser);
            localStorage.setItem("userInfo", JSON.stringify(cleanedUser));
          }
        }

        const storedCart = localStorage.getItem("cartItems");
        if (storedCart) {
          try {
            const items = JSON.parse(storedCart);
            setCartCount(Array.isArray(items) ? items.length : 0);
          } catch {
            setCartCount(0);
          }
        }
      } catch (err) {
        console.error("Failed to sync user:", err);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        setUser(null);
      }
    };

    syncUserFromStorageOrAPI();
    const handleStorageChange = () => {
      syncUserFromStorageOrAPI();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const menuItems = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Menu",
      dropdown: [
        { label: "Cakes", path: "/cakes" },
        { label: "Pastries", path: "/pastries" },
        { label: "Cupcakes", path: "/cupcakes" },
        { label: "Bread & Cookies", path: "/cookies" },
        { label: "More", path: "/menu" },
      ],
    },
    {
      name: "Categories",
      dropdown: [
        { label: "Birthday Cakes", path: "/birthday" },
        { label: "Anniversary Cakes", path: "/anniversary" },
        { label: "Wedding Cakes", path: "/wedding" },
      ],
    },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed left-1/2 -translate-x-1/2 w-[100%] lg:w-[100%] z-50">
      <div
        className="bg-[#6f482a]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]
        border border-white/20 px-5 sm:px-8 md:px-10 py-3 
        flex items-center justify-between transition-all"
      >
        {/* Logo */}
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
                  {item.dropdown.map((d) => (
                    <Link
                      key={d.label}
                      to={d.path}
                      className="block px-4 py-2 text-sm text-[#8b5e3c]
                      hover:bg-[#f8e9dd] hover:text-[#c57b41] transition"
                    >
                      {d.label}
                    </Link>
                  ))}
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

        {/* DESKTOP BUTTONS */}
        <div className="hidden xl:flex items-center gap-5">
          <HashLink smooth to="/#mostSellingItems">
            <button
              className="px-6 py-2 rounded-full bg-white 
    text-[#8b5e3c] font-semibold shadow-lg hover:scale-105 transition cursor-pointer border border-[#6f482a]"
            >
              Order Now
            </button>
          </HashLink>

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
                      src={user.profilePicture}
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
                text-[#8b5e3c] font-semibold shadow-lg hover:scale-105 transition cursor-pointer border border-[#6f482a]"
              >
                Login Now
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

                <div className="mt-2 flex flex-col space-y-2 pl-3">
                  {item.dropdown.map((d) => (
                    <Link
                      key={d.label}
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

          <div className="flex flex-row items-center gap-3">
            <Link to="/order" onClick={() => setOpen(false)}>
              <button
                className="w-42 px-6 py-2 rounded-full bg-white 
                text-[#8b5e3c] border border-[#6f482a] font-semibold shadow-lg hover:scale-105 transition"
              >
                Order Now
              </button>
            </Link>

            {!user ? (
              <Link to="/login" onClick={() => setOpen(false)}>
                <button className="w-42 px-6 py-2 rounded-full bg-white text-[#8b5e3c] font-semibold shadow-lg hover:scale-105 transition border border-[#6f482a]">
                  Login Now
                </button>
              </Link>
            ) : (
              <div className="flex items-center gap-5 ml-auto">
                <Link to="/cart">
                  <div className="relative">
                    <FaShoppingCart
                      size={26}
                      className="text-[#8b5e3c] hover:text-[#f3d2ae] transition"
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

                <Link to="/profile">
                  <div className="w-10 h-10 rounded-full overflow-hidden hover:scale-110 transition">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
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
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
