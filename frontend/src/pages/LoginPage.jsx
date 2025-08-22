import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UserLoginForm from '../components/UserLoginForm';
import UserRegisterForm from '../components/UserRegisterForm';
import MemberLoginForm from '../components/MemberLoginForm';
import MemberRegisterForm from '../components/MemberRegisterForm';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [formType, setFormType] = useState('login');
  const navigate = useNavigate();

  const handleLoginSuccess = (userType) => {
    if (userType === 'admin') {
      navigate('/admin/dashboard');
    } else if (userType === 'member') {
      navigate('/member/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-sky-200/40 to-indigo-200/20 blur-3xl" />
        <div className="absolute right-[-120px] top-28 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-200/40 to-sky-200/20 blur-2xl" />
      </div>

      <motion.div
        className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Branding */}
          <div className="md:w-2/5 bg-gradient-to-br from-sky-100 to-indigo-100 text-gray-800 p-8 flex flex-col justify-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiM1Njk4RkYiIHN0cm9rZS13aWR0aD0iMC41Ij48cGF0aCBkPSJNMzAgMS41bDE0LjMgOC4yNXYxNi41TDMwIDM0LjVsLTE0LjMtOC4yNXYtMTYuNUwzMCAxLjV6Ii8+PHBhdGggZD0iTTE1LjcgMTcuMjVMMS41IDkuMjV2MTYuNWwxNC4zIDguMjVWMzQuNXoiLz48cGF0aCBkPSJNNDQuMyAxNy4yNUw1OC41IDkuMjV2MTYuNWwtMTQuMyA4LjI1VjM0LjV6Ii8+PC9nPjwvc3ZnPg==')] bg-repeat" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative z-10"
            >
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                SUCSS Portal
              </h1>
              <p className="text-gray-700">
                Access your account to manage memberships, events, and community activities
              </p>
              <div className="mt-8">
                <div className="h-1 w-16 bg-gradient-to-r from-sky-400 to-indigo-400 mb-4 rounded-full"></div>
                <p className="text-sm text-gray-600">
                  Sijgeria Umesh Chandra Smriti Sangha
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Paschim Medinipur, West Bengal
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Forms */}
          <div className="md:w-3/5 p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-3 px-6 font-medium rounded-t-lg transition-all ${
                  activeTab === 'user'
                    ? 'text-sky-700 bg-sky-50 border-b-2 border-sky-500'
                    : 'text-gray-600 hover:text-sky-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('user')}
              >
                User Account
              </button>
              <button
                className={`py-3 px-6 font-medium rounded-t-lg transition-all ${
                  activeTab === 'member'
                    ? 'text-sky-700 bg-sky-50 border-b-2 border-sky-500'
                    : 'text-gray-600 hover:text-sky-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('member')}
              >
                Member Account
              </button>
            </div>

            {/* Form Toggle */}
            <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
              <button
                className={`flex-1 py-2 px-4 font-medium rounded-xl transition-all ${
                  formType === 'login'
                    ? 'text-white bg-gradient-to-r from-sky-500 to-indigo-500 shadow-md'
                    : 'text-gray-600 hover:text-sky-600'
                }`}
                onClick={() => setFormType('login')}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 px-4 font-medium rounded-xl transition-all ${
                  formType === 'register'
                    ? 'text-white bg-gradient-to-r from-sky-500 to-indigo-500 shadow-md'
                    : 'text-gray-600 hover:text-sky-600'
                }`}
                onClick={() => setFormType('register')}
              >
                Register
              </button>
            </div>

            {/* Forms */}
            <motion.div
              key={`${activeTab}-${formType}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-y-auto pr-2 flex items-center justify-center"
            >
              {activeTab === 'user' && formType === 'login' && (
                <UserLoginForm onLoginSuccess={() => handleLoginSuccess('user')} />
              )}
              {activeTab === 'user' && formType === 'register' && <UserRegisterForm />}
              {activeTab === 'member' && formType === 'login' && (
                <MemberLoginForm onLoginSuccess={() => handleLoginSuccess('member')} />
              )}
              {activeTab === 'member' && formType === 'register' && <MemberRegisterForm />}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
