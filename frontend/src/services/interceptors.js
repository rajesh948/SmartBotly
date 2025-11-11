import toast from 'react-hot-toast';
import axiosInstance from './axiosInstance';

/**
 * Request Deduplication
 * Prevents duplicate API calls by tracking pending requests
 */
const pendingRequests = new Map();

/**
 * Generate a unique key for each request
 */
const generateRequestKey = (config) => {
  const { method, url, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
};

/**
 * Request Interceptor
 * Adds authorization token and handles request deduplication
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authorization token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Skip deduplication for POST, PUT, PATCH, DELETE (write operations)
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      return config;
    }

    // Check for duplicate GET requests
    const requestKey = generateRequestKey(config);

    if (pendingRequests.has(requestKey)) {
      // Cancel duplicate request
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort();
      console.log('[Dedup] Prevented duplicate request:', config.url);
      return config;
    }

    // Add to pending requests
    pendingRequests.set(requestKey, Date.now());

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common error responses and cleans up pending requests
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Clean up pending request
    const requestKey = generateRequestKey(response.config);
    pendingRequests.delete(requestKey);

    // Return successful response as-is
    return response;
  },
  (error) => {
    // Clean up pending request on error
    if (error.config) {
      const requestKey = generateRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    const { response, config } = error;

    // Ignore aborted requests (from deduplication)
    if (error.code === 'ERR_CANCELED' || error.name === 'AbortError' || error.name === 'CanceledError') {
      return Promise.reject(error);
    }

    // Don't intercept during login attempts or token validation
    const isLoginAttempt = config?.url === '/auth/login' || config?.url === '/client/login';
    const isTokenValidation = config?.url === '/auth/validate';

    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - Token expired or invalid
          if (!isLoginAttempt && !isTokenValidation) {
            console.error('Unauthorized: Token expired or invalid');
            handleLogout('Your session has expired. Please login again.');
          }
          break;

        case 403:
          // Forbidden - Account deactivated or insufficient permissions
          if (response.data?.accountDeactivated) {
            handleAccountDeactivation(response.data.message);
          } else if (!isLoginAttempt) {
            toast.error(response.data?.message || 'You do not have permission to access this resource.');
          }
          break;

        case 404:
          // Not Found
          if (!isLoginAttempt && !isTokenValidation) {
            console.error('Resource not found:', config?.url);
          }
          break;

        case 500:
          // Server Error
          toast.error('Server error. Please try again later.');
          break;

        default:
          // Other errors
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      toast.error('Network error. Please check your internet connection.');
    }

    return Promise.reject(error);
  }
);

/**
 * Handle user logout
 */
const handleLogout = (message = null) => {
  // Clear all stored data
  localStorage.clear();

  // Show message if provided
  if (message) {
    toast.error(message);
  }

  // Redirect to login
  setTimeout(() => {
    window.location.href = '/login';
  }, 100);
};

/**
 * Handle account deactivation
 */
const handleAccountDeactivation = (message) => {
  // Show deactivation message
  toast.error(message || 'Your account has been deactivated. Please contact admin.');

  // Clear all stored data
  localStorage.clear();

  // Redirect to login after showing message
  setTimeout(() => {
    window.location.href = '/login';
  }, 2000);
};

/**
 * Cleanup stale pending requests periodically
 * Remove entries older than 5 seconds
 */
setInterval(() => {
  const now = Date.now();
  const staleThreshold = 5000; // 5 seconds

  for (const [key, timestamp] of pendingRequests.entries()) {
    if (now - timestamp > staleThreshold) {
      pendingRequests.delete(key);
    }
  }
}, 10000); // Run every 10 seconds

export default axiosInstance;
