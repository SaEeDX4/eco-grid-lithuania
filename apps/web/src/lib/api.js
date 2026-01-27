import axios from "axios";

// ✅ Single source of truth for API base URL
// Local: http://localhost:5000
// Prod : https://eco-grid-lithuania.onrender.com
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// ✅ Request interceptor (attach token)
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.warn("No localStorage (SSR?)");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ Response interceptor (auto logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("token");
      } catch (e) {}
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

export default api;
