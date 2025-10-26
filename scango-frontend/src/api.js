import axios from "axios";

// Detect if running on localhost or mobile device
const isLocal = 
  window.location.hostname === "localhost" || 
  window.location.hostname === "127.0.0.1";

// Use the correct backend URL automatically
const API_BASE_URL = isLocal
  ? "http://127.0.0.1:8000"          // local mode
  : import.meta.env.VITE_API_URL || "https://scango-backend.onrender.com";    // same Wi-Fi IP for mobile access

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
