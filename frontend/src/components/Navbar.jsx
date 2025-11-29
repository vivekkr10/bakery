import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/homePage/logo White.png";

const Navbar = () => {
    const [open, setOpen] = useState(false);

    const menuItems = [
        {
            name: "Menu",
            dropdown: [
                { label: "Cakes", path: "/cakes" },
                { label: "Pastries", path: "/pastries" },
                { label: "Cupcakes", path: "/cupcakes" },
                { label: "Bread & Cookies", path: "/cookies" },
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
        { name: "Gallery", path: "/gallery" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] lg:w-[85%] z-50">
            <div
                className="bg-[#6f482a]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]
                border border-white/20 rounded-full 
                px-5 sm:px-8 md:px-10 py-3 
                flex items-center justify-between transition-all"
            >
                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <img
                        src={logo}
                        alt="logo"
                        className="h-10 sm:h-12 w-auto drop-shadow-md hover:scale-110 transition"
                    />
                </Link>

                {/* Desktop Menu */}
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

                                {/* Dropdown */}
                                <div
                                    className="absolute top-full left-1/2 -translate-x-1/2 
                                    w-48 bg-white/95 backdrop-blur-md shadow-xl rounded-xl py-2 mt-3
                                    opacity-0 scale-95 pointer-events-none
                                    group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto
                                    transition-all duration-300 ease-out"
                                >
                                    {item.dropdown.map((d) => (
                                        <Link
                                            key={d.label}
                                            to={d.path}
                                            className="block px-4 py-2 text-sm text-[#8b5e3c] hover:bg-[#f8e9dd] hover:text-[#c57b41] transition"
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

                {/* Desktop Buttons */}
                <div className="hidden xl:flex items-center gap-3">
                    <Link to="/order">
                        <button className="px-6 py-2 rounded-full bg-gradient-to-r from-[#dda56a] to-[#e8b381] 
                        text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition">
                            Order Now
                        </button>
                    </Link>
                    <Link to="/login">
                        <button className="px-6 py-2 rounded-full bg-white 
                        text-[#8b5e3c] font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition">
                            Login Now
                        </button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="xl:hidden text-white" onClick={() => setOpen(!open)}>

                    {open ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {/* <div
                className={`md:hidden bg-white/90 backdrop-blur-xl mt-3 rounded-2xl shadow-xl overflow-hidden 
                transition-all duration-500 
                ${open ? "max-h-[500px] py-4" : "max-h-0"}`}
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
                                            className="hover:text-[#c57b41]"
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
                                className="hover:text-[#c57b41]"
                            >
                                {item.name}
                            </Link>
                        )
                    )} */}

            {/* Buttons */}
            {/* <Link to="/order" onClick={() => setOpen(false)}>
                        <button className="w-full px-6 py-2 rounded-full bg-gradient-to-r from-[#dda56a] to-[#e8b381] 
                        text-white font-semibold shadow-lg hover:scale-105 transition">
                            Order Now
                        </button>
                    </Link>

                    <Link to="/login" onClick={() => setOpen(false)}>
                        <button className="w-full px-6 py-2 rounded-full bg-white text-[#8b5e3c] font-semibold shadow-lg hover:scale-105 transition">
                            Login Now
                        </button>
                    </Link>
                </ul>
            </div> */}

            {/* Ipad view */}

            <div
                className={`xl:hidden bg-white/90 backdrop-blur-xl mt-3 rounded-2xl shadow-xl overflow-hidden 
    transition-all duration-500 
    ${open ? "max-h-[600px] py-4" : "max-h-0"}`}
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
                                            className="hover:text-[#c57b41]"
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
                                className="hover:text-[#c57b41]"
                            >
                                {item.name}
                            </Link>
                        )
                    )}

                    {/* Buttons */}
                    <Link to="/order" onClick={() => setOpen(false)}>
                        <button className="w-full px-6 py-2 rounded-full bg-gradient-to-r from-[#dda56a] to-[#e8b381] 
            text-white font-semibold shadow-lg hover:scale-105 transition">
                            Order Now
                        </button>
                    </Link>

                    <Link to="/login" onClick={() => setOpen(false)}>
                        <button className="w-full px-6 py-2 rounded-full bg-white text-[#8b5e3c] font-semibold shadow-lg hover:scale-105 transition">
                            Login Now
                        </button>
                    </Link>
                </ul>
            </div>

        </nav>
    );
};

export default Navbar;
