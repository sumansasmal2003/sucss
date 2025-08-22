// File: AdminLoginPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { setAuthToken, setUserType, setUserData, getAuthToken, getUserType } from '../utils/auth';
import { loginUser } from '../services/api';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const userType = getUserType();

    if (token && userType === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error('Please fill all fields');
      }

      const response = await loginUser({
        username: username.trim(),
        password: password.trim()
      });

      if (response.data.userData.role !== 'admin') {
        throw new Error('Administrator privileges not found');
      }

      if (response.data.userData.isBlocked) {
        throw new Error('Admin account has been blocked');
      }

      setAuthToken(response.data.token);
      setUserType('admin');
      setUserData(response.data.userData);

      navigate('/admin/dashboard');
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';

      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 401) {
          errorMessage = 'Invalid credentials';
        } else if (err.response.status === 403) {
          errorMessage = 'Account blocked';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Portal</h1>
            <p className="text-gray-600 mt-1">Sijgeria Umesh Chandra Smriti Sangha</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                className="bg-red-50 text-red-700 p-3 rounded-md border border-red-100"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
                <label htmlFor="admin-username" className="sr-only">Admin Username</label>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Admin Username"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-transparent placeholder-gray-400 outline-none"
                  required
                />
              </div>

              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
                <label htmlFor="admin-password" className="sr-only">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-transparent placeholder-gray-400 outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-admin"
                  className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-300 outline-none"
                />
                <label htmlFor="remember-admin" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <a href="#" className="text-sm text-sky-600 hover:text-sky-700">
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-3 rounded-lg font-medium shadow"
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
                  Authenticating...
                </span>
              ) : 'Login as Admin'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Sijgeria Umesh Chandra Smriti Sangha</p>
            <p className="text-gray-400 text-xs mt-1">Administrative access only</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
