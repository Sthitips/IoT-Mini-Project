import axios from "axios";

// In production (Vercel): VITE_API_URL = "https://agropulse-backend.onrender.com/api"
// In dev (Vite port 5173): uses /api proxy defined in vite.config.js
const getBaseURL = () => {
  // Explicit env var always wins (set in Vercel dashboard for production)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  // Dev server: use Vite proxy
  if (typeof window !== "undefined" && window.location.port === "5173") {
    return "/api";
  }

  // Fallback: same host on port 8000
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }

  return "http://127.0.0.1:8000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Cache-busting interceptor: prevents desktop Chrome/Edge from caching polling responses
api.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    _t: Date.now(),
  };
  config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
  config.headers["Pragma"] = "no-cache";
  config.headers["Expires"] = "0";
  return config;
});

export default api;