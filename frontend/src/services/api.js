import axios from 'axios';

// In production, VITE_API_URL = full URL (https://backend.onrender.com/api)
// In development, use '/api' so Vite proxy handles it
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 second timeout for slow connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem('miskara_user') || 'null');
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      // ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear and redirect to login
      localStorage.removeItem('miskara_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
