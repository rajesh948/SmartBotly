import axios from 'axios';

/**
 * Axios Instance
 * Base configuration for all API requests
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

export default axiosInstance;
