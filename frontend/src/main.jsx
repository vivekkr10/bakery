import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./components/redux/Store";
import App from "./App";
import "./index.css";

// 🔥 AXIOS GLOBAL SETUP
import axios from "axios";

// ✅ AUTO SWITCH BASE URL
// Local → localhost
// Production → Render
axios.defaults.baseURL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_BASE_URL;

// ✅ Allow cookies if ever needed
axios.defaults.withCredentials = true;

// 🔐 AUTO ATTACH TOKEN (ADMIN / USER)
axios.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

// 🔁 AUTO LOGOUT ON TOKEN EXPIRE
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
