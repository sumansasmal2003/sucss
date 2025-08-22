import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser, FiLock, FiMail, FiPhone, FiBriefcase,
  FiCheck, FiClock, FiArrowLeft, FiRefreshCw
} from 'react-icons/fi';
import { sendMemberOtp, verifyMemberOtp } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MemberRegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    memberId: '',
    fullName: '',
    phone: '',
    email: '',
    designation: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const designations = [
    'Member',
    'Secretary',
    'Treasurer',
    'President',
    'Vice President',
    'Committee Member'
  ];

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && otpSent) {
      setResendDisabled(false);
    }

    return () => clearInterval(timer);
  }, [otpTimer, otpSent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlesendMemberOtp = async () => {
    // Validate required fields
    const requiredFields = ['memberId', 'fullName', 'phone', 'email', 'designation', 'password', 'confirmPassword'];
    const missingField = requiredFields.find(field => !formData[field].trim());

    if (missingField) {
      setError(`Please fill in the ${missingField.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendMemberOtp({
        ...formData,
        userType: 'member' // Tell backend this is for member registration
      });

      setOtpSent(true);
      setOtpTimer(300); // 5 minutes
      setResendDisabled(true);
      setResendCount(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendMemberOtp = async () => {
    if (resendCount >= 3) {
      setError('Maximum resend attempts reached. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendMemberOtp({
        email: formData.email,
        memberId: formData.memberId,
        userType: 'member'
      });

      setOtpTimer(300); // Reset to 5 minutes
      setResendDisabled(true);
      setResendCount(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleverifyMemberOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify OTP and complete registration
      await verifyMemberOtp({
        email: formData.email,
        otp,
        userType: 'member'
      });

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          memberId: '',
          fullName: '',
          phone: '',
          email: '',
          designation: '',
          password: '',
          confirmPassword: ''
        });
        setOtp('');
        setOtpSent(false);
        setOtpTimer(0);
        setResendCount(0);
        setSuccess(false);
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {otpSent ? 'Verify Your Email' : 'Member Registration'}
          </h2>
          {otpSent && (
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="flex items-center text-sky-600 hover:underline"
            >
              <FiArrowLeft className="mr-1" /> Edit Details
            </button>
          )}
        </div>

        <div className="bg-sky-50 border-l-4 border-sky-200 p-4 mb-4 rounded-lg">
          <p className="text-sky-700 text-sm">
            <strong>Note:</strong> After registration, your account will be in pending status until approved by an administrator. You'll receive an email once approved.
          </p>
        </div>

        {error && (
          <motion.div
            className="bg-red-50 text-red-700 p-3 rounded-md border border-red-100 mb-4"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            className="bg-green-50 text-green-700 p-3 rounded-md border border-green-100 mb-4 flex items-center"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCheck className="mr-2 text-lg" />
            <div>
              <p className="font-medium">Registration submitted!</p>
              <p>Your account is pending admin approval.</p>
            </div>
          </motion.div>
        )}

        {!otpSent ? (
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
                <input
                  type="text"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  placeholder="Member ID"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-300 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-300 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-300 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-300 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="relative md:col-span-2">
                <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-sky-300 focus:border-transparent appearance-none outline-none"
                  required
                >
                  <option value="">Select Designation</option>
                  {designations.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password (min 6 chars)"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-300 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-300 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="memberTerms"
                className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-300 mt-1 bg-white"
                required
              />
              <label htmlFor="memberTerms" className="ml-2 text-sm text-gray-700">
                I agree to the Terms and Conditions and Club Bylaws
              </label>
            </div>

            <motion.button
              type="button"
              onClick={handlesendMemberOtp}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-3 rounded-xl font-medium shadow"
              whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(14,165,233,0.12)' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2-647z"></path>
                  </svg>
                  Sending OTP...
                </span>
              ) : 'Send Verification Code'}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleverifyMemberOtp} className="space-y-6">
            <div className="text-center">
              <div className="bg-sky-50 inline-block p-4 rounded-full mb-4">
                <FiMail className="text-sky-500 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Check your email</h3>
              <p className="text-gray-600">
                We've sent a 6-digit code to <span className="font-semibold">{formData.email}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="flex-1 pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-sky-300 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <FiClock className="mr-1 text-sky-500" />
                  <span className={otpTimer < 60 ? "text-amber-500" : "text-gray-600"}>
                    {otpTimer > 0 ? `Expires in ${formatTime(otpTimer)}` : 'Code expired'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResendMemberOtp}
                  disabled={resendDisabled || resendCount >= 3}
                  className={`text-sm ${resendDisabled || resendCount >= 3 ? 'text-gray-400' : 'text-sky-600 hover:underline'}`}
                >
                  <FiRefreshCw className="inline mr-1" />
                  Resend OTP
                </button>
              </div>

              {resendCount >= 3 && (
                <p className="text-sm text-amber-600">
                  You've reached the maximum resend attempts. Please try again later.
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white py-3 rounded-xl font-medium shadow"
              whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(14,165,233,0.12)' }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || otp.length !== 6 || otpTimer === 0}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2-647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : 'Complete Registration'}
            </motion.button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default MemberRegisterForm;
