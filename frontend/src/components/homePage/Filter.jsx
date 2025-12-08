import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/Slice";
import { useSearchParams } from "react-router-dom";

export default function FilterPage() {
  const [active, setActive] = useState("Classic Cakes");
  const [showFilter, setShowFilter] = useState(false);
  const [showDesktopFilter, setShowDesktopFilter] = useState(true);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Helper function to fix image URLs
  const fixImageUrl = (url) => {
    if (!url || url === "undefined" || url === "null") {
      console.log("🖼️ No image URL, using fallback");
      return "/cake5.jpg";
    }

    console.log("🖼️ Original URL:", url);

    // If already a full URL, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Clean the URL
    let cleanUrl = url.trim();

    // Remove any ../ or ./ prefixes
    cleanUrl = cleanUrl.replace(/^(\.\.\/|\.\/)+/, "");

    // Ensure it starts with a slash
    if (!cleanUrl.startsWith("/")) {
      cleanUrl = "/" + cleanUrl;
    }

    // Fix common issues
    if (cleanUrl.includes("//")) {
      cleanUrl = cleanUrl.replace(/\/+/g, "/");
    }

    // Ensure it has the correct uploads path
    if (!cleanUrl.includes("uploads/")) {
      cleanUrl =
        "/uploads/products" + (cleanUrl.startsWith("/") ? "" : "/") + cleanUrl;
    }

    // Build the final URL
    const baseUrl = "http://localhost:5000";
    const finalUrl = baseUrl + cleanUrl;

    console.log("✅ Fixed URL:", finalUrl);
    return finalUrl;
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Get category from URL if present
        const urlCategory = searchParams.get("category");
        if (urlCategory && categories.includes(urlCategory)) {
          setActive(urlCategory);
        }

        const response = await axios.get("http://localhost:5000/api/product", {
          params: {
            limit: 100,
          },
        });

        console.log("📦 Full API response:", response.data);
        console.log(
          "🖼️ First product images:",
          response.data.products?.[0]?.images
        );

        if (response.data && response.data.success) {
          const formattedProducts = response.data.products.map((product) => {
            const imageUrl =
              product.images && product.images.length > 0
                ? product.images[0]
                : "/cake5.jpg";

            return {
              id: product._id || product.id,
              name: product.name,
              price: product.price,
              img: fixImageUrl(imageUrl),
              category: product.category || "Classic Cakes",
              description: product.description || "Delicious bakery item",
              stock: product.stock || 10,
            };
          });

          setProducts(formattedProducts);

          const uniqueCategories = [
            ...new Set(formattedProducts.map((p) => p.category)),
          ];
          setCategories(uniqueCategories);

          // Set active category: URL param > default > first category
          if (urlCategory && uniqueCategories.includes(urlCategory)) {
            setActive(urlCategory);
          } else if (
            uniqueCategories.length > 0 &&
            !uniqueCategories.includes(active)
          ) {
            setActive(uniqueCategories[0]);
          }

          toast.success(`Loaded ${formattedProducts.length} products!`);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("Failed to load products from server");
        setCategories(["Classic Cakes", "Premium Cakes"]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Handle Add to Cart
  const handleAddToCart = (product) => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login to add items to cart");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      console.log("🛒 Adding product to cart:", product);
      console.log("🖼️ Product image URL:", product.img);

      // Dispatch to Redux store
      dispatch(
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.img,
          qty: 1,
        })
      );

      toast.success(`${product.name} added to cart!`, {
        icon: "🛒",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  // Filter logic
  const filteredData = products.filter(
    (item) => item.category === active && item.price <= maxPrice
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7efe7] pt-28 md:pt-32 px-4 sm:px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a6662e]"></div>
          <p className="mt-4 text-lg text-[#a6662e]">
            Loading delicious cakes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7efe7] pt-28 md:pt-32 px-4 sm:px-6 lg:px-8 relative">
      {/* FILTER BUTTON - Mobile only */}
      <button
        onClick={() => setShowFilter(true)}
        className="lg:hidden fixed left-4 top-1/2 transform -translate-y-1/2 z-40 bg-[#a6662e] text-white px-4 py-3 rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="hidden sm:inline">Filters</span>
      </button>

      {/* DESKTOP FILTER TOGGLE BUTTON */}
      <button
        onClick={() => setShowDesktopFilter(!showDesktopFilter)}
        className="hidden lg:flex fixed top-1/2 transform -translate-y-1/2 z-50 bg-[#a6662e] text-white px-3 py-4 rounded-r-xl shadow-lg hover:scale-105 transition-all duration-300 items-center gap-2"
        style={{ left: showDesktopFilter ? "256px" : "0" }}
      >
        {showDesktopFilter ? (
          <>
            <svg
              className="w-5 h-5 transform rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden xl:inline">Hide </span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="hidden xl:inline">Show</span>
          </>
        )}
      </button>

      {/* DESKTOP SIDEBAR FILTER */}
      <div
        className={`hidden lg:block fixed left-0 top-28 h-[calc(100vh-7rem)] w-64 bg-white shadow-2xl z-40 overflow-y-auto transition-all duration-300
        ${showDesktopFilter ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#a6662e]">Filters</h2>
            <button
              onClick={() => setShowDesktopFilter(false)}
              className="text-gray-500 hover:text-red-600 transition"
              title="Hide Filters"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* PRICE SLIDER */}
          <div className="mb-8">
            <label className="font-semibold text-gray-700 block mb-3">
              Price Range
            </label>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-3">
              <span className="text-sm text-gray-600">₹ 100</span>
              <span className="text-lg font-bold text-[#a6662e]">
                Up to ₹ {maxPrice}
              </span>
              <span className="text-sm text-gray-600">₹ 1500</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      active === cat
                        ? "bg-[#a6662e] text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setMaxPrice(1500)}
              className="w-full py-2 text-center text-[#a6662e] font-semibold border-2 border-[#a6662e] rounded-lg hover:bg-[#a6662e] hover:text-white transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SLIDE FILTER PANEL */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-2xl p-6 z-50 transition-transform duration-300 overflow-y-auto
        ${showFilter ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#a6662e]">Filters</h2>
          <button
            onClick={() => setShowFilter(false)}
            className="text-xl font-bold hover:text-red-600 transition"
          >
            ✖
          </button>
        </div>

        {/* PRICE SLIDER */}
        <div className="mb-8">
          <label className="font-semibold text-gray-700 block mb-3">
            Price Range
          </label>
          <input
            type="range"
            min="100"
            max="1500"
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between mt-3">
            <span className="text-sm text-gray-600">₹ 100</span>
            <span className="text-lg font-bold text-[#a6662e]">
              Up to ₹ {maxPrice}
            </span>
            <span className="text-sm text-gray-600">₹ 1500</span>
          </div>
        </div>

        {/* Categories in Filter Panel */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActive(cat);
                  setShowFilter(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    active === cat
                      ? "bg-[#a6662e] text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              setMaxPrice(1500);
              setShowFilter(false);
            }}
            className="w-full py-2 text-center text-[#a6662e] font-semibold border-2 border-[#a6662e] rounded-lg hover:bg-[#a6662e] hover:text-white transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* BACKDROP OVERLAY */}
      {showFilter && (
        <div
          onClick={() => setShowFilter(false)}
          className="lg:hidden fixed inset-0 bg-black/30 z-40 cursor-pointer"
        ></div>
      )}

      {/* MAIN CONTENT - Fixed width, no conditional margin */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#a6662e]">
            Our Delicious Cakes
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Freshly baked with love and premium ingredients
          </p>
        </div>

        {/* CATEGORY BUTTONS - Show on desktop when filter is hidden, always show on mobile */}
        <div
          className={`flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8 ${
            showDesktopFilter ? "lg:hidden" : ""
          }`}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold transition-all duration-300 shadow-md whitespace-nowrap
                ${
                  active === cat
                    ? "bg-gradient-to-r from-[#a6662e] to-[#8a5527] text-white scale-105 shadow-lg"
                    : "bg-white text-[#a6662e] hover:shadow-lg hover:bg-gray-50 border border-gray-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT INFO BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 px-4 py-3 md:py-4 bg-white rounded-xl md:rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-3 sm:mb-0">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm md:text-base">
                Active Category:
              </span>
              <span className="font-bold text-[#a6662e] px-3 py-1 bg-[#f7efe7] rounded-full text-sm md:text-base">
                {active}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm md:text-base">
                Max Price:
              </span>
              <span className="font-bold text-[#a6662e] text-sm md:text-base">
                ₹ {maxPrice}
              </span>
            </div>
            {/* Desktop filter toggle indicator */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-gray-600 text-sm">Filter Panel:</span>
              <button
                onClick={() => setShowDesktopFilter(!showDesktopFilter)}
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  showDesktopFilter
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {showDesktopFilter ? "Visible" : "Hidden"}
              </button>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-gray-700 text-sm md:text-base">
              Showing{" "}
              <span className="font-bold text-[#a6662e]">
                {filteredData.length}
              </span>{" "}
              of {products.length} products
            </p>
          </div>
        </div>

        {/* PRODUCT GRID - Adjusts automatically based on available space */}
        {filteredData.length > 0 ? (
          <div
            className={`grid gap-4 md:gap-6 
            ${
              showDesktopFilter
                ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4"
                : "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            }`}
          >
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                {/* Product Image */}
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      console.error("❌ Image failed to load:", item.img);
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&auto=format";
                    }}
                  />
                  {/* Price Tag */}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-2 rounded-lg shadow-md">
                    <span className="text-sm md:text-lg font-bold text-[#a6662e]">
                      ₹ {item.price}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 md:p-5">
                  <h3 className="font-bold text-base md:text-xl text-gray-800 mb-1 md:mb-2 line-clamp-1">
                    {item.name}
                  </h3>

                  {item.description && (
                    <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3 md:mb-5">
                    <span className="text-xs md:text-sm font-medium px-2 py-1 md:px-3 md:py-1 bg-gray-100 text-gray-700 rounded-full">
                      {item.category}
                    </span>
                    <div className="text-right">
                      <span
                        className={`text-xs md:text-sm font-medium ${
                          item.stock > 5 ? "text-green-600" : "text-orange-600"
                        }`}
                      >
                        {item.stock > 5 ? "In Stock" : "Low Stock"}
                      </span>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className={`w-full py-2 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base
                      ${
                        item.stock === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#a6662e] to-[#8a5527] text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                  >
                    {item.stock === 0 ? (
                      <>
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Out of Stock
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-[#f7efe7] rounded-full mb-4 md:mb-6">
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-[#a6662e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-2 md:mb-3">
              No products found
            </h3>
            <p className="text-gray-500 mb-6 md:mb-8 max-w-md mx-auto text-base md:text-lg">
              No {active.toLowerCase()} found under ₹{maxPrice}. Try increasing
              the price range or selecting a different category.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <button
                onClick={() => setMaxPrice(1500)}
                className="px-4 py-2 md:px-6 md:py-3 bg-[#a6662e] text-white rounded-lg hover:bg-[#8a5527] transition font-semibold text-sm md:text-base"
              >
                Reset Price Filter
              </button>
              <button
                onClick={() => setActive(categories[0] || "Classic Cakes")}
                className="px-4 py-2 md:px-6 md:py-3 bg-white text-[#a6662e] border-2 border-[#a6662e] rounded-lg hover:bg-[#f7efe7] transition font-semibold text-sm md:text-base"
              >
                Change Category
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
