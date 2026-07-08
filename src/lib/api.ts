import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Add auth headers if applicable
    const stored = localStorage.getItem('rsms_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.role) config.headers['X-User-Role'] = user.role;
        if (user.scholarId) config.headers['X-Scholar-Id'] = user.scholarId;
        if (user.guideName) config.headers['X-Guide-Name'] = user.guideName;
        if (user.guideId) config.headers['X-Guide-Id'] = user.guideId;
        if (user.name) config.headers['X-User-Name'] = user.name;
        if (user.id) config.headers['X-User-Id'] = user.id;
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    
    // Centralized error handling
    console.error('API Error:', message);
    // Optionally toast errors centrally if they aren't handled locally
    // toast.error(message); 
    
    return Promise.reject(error);
  }
);

export default api;
