import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  increaseQty,
  decreaseQty,
  deleteItem,
  clearCart,
  selectCart,
} from "../redux/Slice";
import { toast } from "react-hot-toast";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, taxRate, delivery } = useSelector(selectCart);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax + delivery;

  const handleProceedToOrder = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/order");
  };

  return (
    <div className="bg-gray-50 min-h-screen mt-24 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some delicious items to get started!
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN - PRODUCTS */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center sm:items-start bg-white p-5 rounded-xl shadow-md border border-gray-100"
                  >
                    <img
                      src={item.image || item.img} // Add this line - use item.image or item.img
                      alt={item.name}
                      className="w-28 h-28 sm:w-24 sm:h-24 rounded-lg object-cover mb-4 sm:mb-0 sm:mr-6"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/cake5.jpg"; // Fallback image
                      }}
                    />

                    <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                      <h4 className="text-xl font-semibold text-gray-800 mb-1">
                        {item.name}
                      </h4>
                      <p className="text-gray-600 mb-2">
                        ₹{item.price.toFixed(2)} each
                      </p>
                      <p className="text-rose-600 font-medium">
                        Total: ₹{(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <button
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        onClick={() => dispatch(decreaseQty(item.id))}
                        disabled={item.qty <= 1}
                      >
                        <span className="text-xl font-bold text-gray-700">
                          −
                        </span>
                      </button>
                      <span className="text-xl font-bold w-8 text-center">
                        {item.qty}
                      </span>
                      <button
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        onClick={() => dispatch(increaseQty(item.id))}
                      >
                        <span className="text-xl font-bold text-gray-700">
                          +
                        </span>
                      </button>
                    </div>

                    <button
                      className="text-red-500 hover:text-red-700 text-2xl p-2 hover:bg-red-50 rounded-full transition-colors"
                      onClick={() => dispatch(deleteItem(item.id))}
                      title="Remove item"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={() => navigate("/menu")}
                  className="px-6 py-3 border-2 border-rose-600 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  ← Continue Shopping
                </button>

                <button
                  onClick={() => {
                    dispatch(clearCart());
                    toast.success("Cart cleared successfully");
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All Items
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN - CHECKOUT BUTTON */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-28">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Ready to Order?
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({items.length})</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>₹{delivery}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-rose-600">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToOrder}
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-lg font-semibold hover:from-rose-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout →
                </button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  Secure checkout · Free delivery over ₹500
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
