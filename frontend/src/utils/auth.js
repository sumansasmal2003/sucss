// Utility functions for authentication
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setUserType = (userType) => {
  localStorage.setItem('userType', userType);
};

export const getUserType = () => {
  return localStorage.getItem('userType');
};

export const setUserData = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
};

export const getUserData = () => {
  const data = localStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('userData');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const isMember = () => {
  return getUserType() === 'member';
};

export const isAdmin = () => {
  return getUserType() === 'admin';
};

export const isUser = () => {
  return getUserType() === 'user';
};

// Add this helper function
export const getCurrentRole = () => {
  return getUserType();
};
