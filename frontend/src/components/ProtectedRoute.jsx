import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserType } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const userType = getUserType();

  if (!isAuth) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
