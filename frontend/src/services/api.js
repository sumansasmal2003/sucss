import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Set up axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle specific error codes
    if (error.response) {
      if (error.response.status === 401) {
        // Handle unauthorized errors
        console.error('Unauthorized access');
      } else if (error.response.status === 403) {
        // Handle forbidden errors
        console.error('Forbidden access');
      }

      // Return the error response
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        response: error.response,
        status: error.response.status
      });
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        request: error.request
      });
    } else {
      // Something happened in setting up the request
      return Promise.reject({
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
);

// Auth API Endpoints
export const sendOtp = (formData) => api.post('/auth/send-otp', formData);
export const verifyOtp = (otpData) => api.post('/auth/verify-otp', otpData);

// Member Auth
export const sendMemberOtp = (formData) => {
  if (formData.userType === 'member') {
    return api.post('/auth/member/send-otp', formData);
  }
  return api.post('/auth/send-otp', formData);
};

export const verifyMemberOtp = (otpData) => {
  if (otpData.userType === 'member') {
    return api.post('/auth/member/verify-otp', otpData);
  }
  return api.post('/auth/verify-otp', otpData);
};

export const registerUser = (userData) => api.post('/auth/user/register', userData);
export const loginUser = (credentials) => api.post('/auth/user/login', credentials);

// Member Auth
export const registerMember = (memberData) => api.post('/auth/member/register', memberData);
export const loginMember = (credentials) => api.post('/auth/member/login', credentials);

// Export the configured instance
export default api;
