import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clearAuth } from '../utils/auth';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <motion.button
      onClick={handleLogout}
      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl flex items-center border border-gray-200 shadow-sm"
      whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(14,165,233,0.12)' }}
      whileTap={{ scale: 0.97 }}
      aria-label="Logout"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
      </svg>
      Logout
    </motion.button>
  );
};

export default LogoutButton;
