import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock } from 'react-icons/fi';
import { loginMember } from '../services/api';
import { setAuthToken, setUserType, setUserData } from '../utils/auth';

const MemberLoginForm = ({ onLoginSuccess }) => {
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginMember({ memberId, password });

      // Save auth data to localStorage
      setAuthToken(response.data.token);
      setUserType('member');
      setUserData(response.data.userData);

      // Trigger success callback
      onLoginSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';

      if (err.response?.data?.status === 'pending') {
        setError('Your account is pending approval. Please contact the administrator.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Member Login</h2>

        <div className="bg-sky-50 border-l-4 border-sky-300 p-3 rounded-md">
          <p className="text-sky-700 text-sm">
            <strong>Note:</strong> Member accounts require admin approval before login access is granted.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Member ID"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-300 focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-300 focus:border-transparent outline-none"
              required
            />
          </div>
        </div>

        <motion.button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-3 rounded-xl font-medium shadow"
          whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(14,165,233,0.12)' }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : 'Login as Member'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default MemberLoginForm;
