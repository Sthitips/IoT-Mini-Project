import axios from "axios";

// Using relative '/api' works on both localhost (laptop) and remote LAN IP (phone)
// because Vite proxies '/api' directly to http://127.0.0.1:8000.
// If accessing directly or in production, fallback to current hostname on port 8000.
const getBaseURL = () => {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8000/api";
  }

  // If environment variable explicitly sets a non-localhost URL
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl !== "http://localhost:8000/api") {
    return envUrl;
  }

  // If running on Vite dev server (port 5173), use relative '/api' proxy
  if (window.location.port === "5173") {
    return "/api";
  }

  // Otherwise, use the current host's port 8000
  return `${window.location.protocol}//${window.location.hostname}:8000/api`;
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