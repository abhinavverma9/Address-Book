import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't retried yet
    // Note: ColdFusion might return 401 if we handle it explicitly, or we might need to check for specific error messages if CF returns 200 with error.
    // Assuming standard 401 for now.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const params = new URLSearchParams();
          params.append('method', 'refreshToken');
          params.append('refreshToken', refreshToken);
          
          // Use basic axios to avoid interceptor loop
          const response = await axios.post('/api/Auth.cfc', params);
          
          if (response.data.success) {
            const newToken = response.data.token;
            localStorage.setItem('accessToken', newToken);
            
            // Update header and retry original request
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          } else {
             throw new Error("Refresh failed");
          }
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
        }
      } else {
          // No refresh token, logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
