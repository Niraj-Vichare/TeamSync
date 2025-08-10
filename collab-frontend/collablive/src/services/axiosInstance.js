import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token and workspace ID
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or your auth state management)
    const token = localStorage.getItem("access_token"); // store token after Supabase login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add workspace ID if available
    const activeWorkspace = JSON.parse(localStorage.getItem("activeWorkspace") || "null");
    if (activeWorkspace?.id) {
      config.headers["X-Workspace-ID"] = activeWorkspace.id;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      console.error("Authentication required");
      // Example: redirect to login
      // window.location.href = "/login";
    }
    if (status === 403) {
      console.error("Access forbidden");
    }
    if (status >= 500) {
      console.error("Server error");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
