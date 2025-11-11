import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect during login attempts or token validation (let components handle those)
    const isLoginAttempt = error.config.url === '/auth/login' || error.config.url === '/client/login';
    const isTokenValidation = error.config.url === '/auth/validate';

    if (error.response?.status === 401 && !isLoginAttempt && !isTokenValidation) {
      // Token is invalid/expired, clear everything and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
