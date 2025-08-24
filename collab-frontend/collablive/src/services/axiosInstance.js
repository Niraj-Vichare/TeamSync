import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add workspace ID
axiosInstance.interceptors.request.use(
  (config) => {
    // Add workspace ID if available
    const currentWorkspaceId = localStorage.getItem('currentWorkspaceId');
    if (currentWorkspaceId) {
      config.headers['X-Workspace-ID'] = currentWorkspaceId;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
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
      // Clear any stored user data
      localStorage.removeItem('currentWorkspaceId');
      
      // Redirect to login page
      // if (window.location.pathname !== '/auth/signin' && window.location.pathname !== '/auth/signup') {
      //   window.location.href = '/auth/signin';
      // }
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