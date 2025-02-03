import axios from '../backend/node_modules/axios';

// Create an axios instance
const axiosInstance = axios.create({
  withCredentials: true, // Send cookies with requests
});

// Interceptor to add Authorization header with the token
axiosInstance.interceptors.request.use((config) => {
  // Get the Authorization header
  const authHeader = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
  
  // Check if the Authorization header exists and split it only if valid
  if (authHeader) {
    const token = authHeader.split('=')[1]; // Extract token from cookie
    config.headers['Authorization'] = `Bearer ${token}`; // Add token to Authorization header
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle token refresh when 401 Unauthorized is encountered
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the response object exists
    if (!error.response) {
      console.error("Error: No response received from server", error);
      return Promise.reject(error); // Reject with the error object
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Trigger token refresh
        await axios.post("http://localhost:8081/token", null, { withCredentials: true });

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh tokens:", refreshError.response || refreshError);
        // Redirect to login if token refresh fails
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
