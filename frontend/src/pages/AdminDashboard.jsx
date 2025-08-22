// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../utils/auth';
import axios from 'axios';
import { format } from 'date-fns';
import { FiX } from 'react-icons/fi'

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingMembers, setPendingMembers] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [rejectedMembers, setRejectedMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    approve: {},
    reject: {},
    block: {},
    unblock: {},
  });

  const handleLogout = () => {
    clearAuth();
    navigate('/admin');
  };

  const startLoading = (actionType, id) => {
    setLoadingStates(prev => ({
      ...prev,
      [actionType]: { ...prev[actionType], [id]: true }
    }));
  };

  const stopLoading = (actionType, id) => {
    setLoadingStates(prev => ({
      ...prev,
      [actionType]: { ...prev[actionType], [id]: false }
    }));
  };

  const closeModals = () => {
    setShowRejectModal(false);
    setShowBlockModal(false);
    setRejectionReason('');
    setBlockReason('');
    setCurrentMemberId(null);
    setCurrentUserId(null);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        const pendingRes = await axios.get('http://localhost:5000/api/auth/admin/members/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingMembers(pendingRes.data || []);

        const approvedRes = await axios.get('http://localhost:5000/api/auth/admin/members/approved', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApprovedMembers(approvedRes.data || []);

        const rejectedRes = await axios.get('http://localhost:5000/api/auth/admin/members/rejected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRejectedMembers(rejectedRes.data || []);

        const usersRes = await axios.get('http://localhost:5000/api/auth/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersRes.data || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const approveMember = async (memberId) => {
    startLoading('approve', memberId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/auth/admin/members/${memberId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let approvedMember = pendingMembers.find(m => m._id === memberId);
      if (!approvedMember) {
        approvedMember = rejectedMembers.find(m => m._id === memberId);
      }

      if (approvedMember) {
        setApprovedMembers(prev => [...prev, {
          ...approvedMember,
          status: 'approved',
          approvedAt: new Date().toISOString()
        }]);

        setPendingMembers(prev => prev.filter(m => m._id !== memberId));
        setRejectedMembers(prev => prev.filter(m => m._id !== memberId));

        setSuccessMessage('Member approved successfully!');
      }

    } catch (err) {
      console.error('Error approving member:', err);
      setError('Failed to approve member. Please try again.');
    } finally {
      stopLoading('approve', memberId);
    }
  };

  const rejectMember = async () => {
    if (!currentMemberId || !rejectionReason) return;
    startLoading('reject', currentMemberId);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/auth/admin/members/${currentMemberId}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rejectedMember = pendingMembers.find(m => m._id === currentMemberId);

      if (rejectedMember) {
        setRejectedMembers(prev => [...prev, {
          ...rejectedMember,
          status: 'rejected',
          rejectionReason,
          rejectedAt: new Date().toISOString()
        }]);

        setPendingMembers(prev => prev.filter(m => m._id !== currentMemberId));

        setSuccessMessage('Member rejected successfully!');
      }

      closeModals();

    } catch (err) {
      console.error('Error rejecting member:', err);
      setError('Failed to reject member. Please try again.');
    } finally {
      stopLoading('reject', currentMemberId);
    }
  };

  const blockUser = async () => {
    if (!currentUserId || !blockReason) return;
    startLoading('block', currentUserId);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/auth/admin/users/${currentUserId}/block`,
        { reason: blockReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(prev => prev.map(user =>
        user._id === currentUserId
          ? { ...user, isBlocked: true, blockReason }
          : user
      ));

      setSuccessMessage('User blocked successfully!');
      closeModals();

    } catch (err) {
      console.error('Error blocking user:', err);
      setError('Failed to block user. Please try again.');
    } finally {
      stopLoading('block', currentUserId);
    }
  };

  const unblockUser = async (userId) => {
    startLoading('unblock', userId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/auth/admin/users/${userId}/unblock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(prev => prev.map(user =>
        user._id === userId
          ? { ...user, isBlocked: false, blockReason: '' }
          : user
      ));

      setSuccessMessage('User unblocked successfully!');
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError('Failed to unblock user. Please try again.');
    } finally {
      stopLoading('unblock', userId);
    }
  };

  const TableEmpty = ({ title, subtitle }) => (
    <div className="text-center py-12 text-gray-600">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-800">{title}</h3>
      <p className="mt-1 text-gray-600">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 overflow-hidden relative">
      {/* subtle background shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-sky-100 to-indigo-50 blur-3xl" />
        <div className="absolute right-[-120px] top-28 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-100 to-sky-50 blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Administrative control panel</p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl flex items-center border border-gray-200 shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
            {error}
          </motion.div>
        )}

        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
            {successMessage}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex flex-wrap gap-2">
            {[
              { id: 'pending', label: 'Pending Members', count: pendingMembers.length },
              { id: 'approved', label: 'Approved Members', count: approvedMembers.length },
              { id: 'rejected', label: 'Rejected Members', count: rejectedMembers.length },
              { id: 'users', label: 'User Management', count: users.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-t-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id ? 'bg-white text-gray-800 border-b-2 border-sky-300' : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-sky-600 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400" />
          </div>
        ) : (
          <>
            {/* Pending */}
            {activeTab === 'pending' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Member ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Designation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {pendingMembers.map(member => (
                        <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{member.memberId}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{member.fullName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{member.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{member.phone}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"><span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">{member.designation}</span></td>
                          <td className="px-6 py-4 text-sm font-medium space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => approveMember(member._id)}
                              disabled={loadingStates.approve[member._id]}
                              className={`px-3 py-1 rounded ${loadingStates.approve[member._id] ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                            >
                              {loadingStates.approve[member._id] ? <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-600" /> : 'Approve'}
                            </button>

                            <button
                              onClick={() => { setCurrentMemberId(member._id); setShowRejectModal(true); }}
                              disabled={loadingStates.reject[member._id]}
                              className={`px-3 py-1 rounded ${loadingStates.reject[member._id] ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                            >
                              {loadingStates.reject[member._id] ? <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-600" /> : 'Reject'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {pendingMembers.length === 0 && <TableEmpty title="No pending applications" subtitle="All member applications have been processed." />}
                </div>
              </motion.div>
            )}

            {/* Approved */}
            {activeTab === 'approved' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Member ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Designation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Approved At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {approvedMembers.map(member => (
                        <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{member.memberId}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{member.fullName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{member.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"><span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">{member.designation}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-700">Approved</span></td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{member.approvedAt ? format(new Date(member.approvedAt), 'dd MMM yyyy, h:mm a') : 'N/A'}</td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <button
                              onClick={() => { setCurrentMemberId(member._id); setShowRejectModal(true); }}
                              className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {approvedMembers.length === 0 && <TableEmpty title="No approved members" subtitle="Approved members will appear here." />}
                </div>
              </motion.div>
            )}

            {/* Rejected */}
            {activeTab === 'rejected' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Member ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Designation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {rejectedMembers.map(member => (
                        <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{member.memberId}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{member.fullName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{member.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"><span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded">{member.designation}</span></td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <button
                              onClick={() => approveMember(member._id)}
                              disabled={loadingStates.approve[member._id]}
                              className={`px-3 py-1 rounded ${loadingStates.approve[member._id] ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                            >
                              {loadingStates.approve[member._id] ? <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-600" /> : 'Approve'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {rejectedMembers.length === 0 && <TableEmpty title="No rejected members" subtitle="Rejected members will appear here." />}
                </div>
              </motion.div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{user.username}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{user.fullName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"><span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">{user.role}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isBlocked ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-700">Blocked</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-700">Active</span>}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            {user.isBlocked ? (
                              <button onClick={() => unblockUser(user._id)} disabled={loadingStates.unblock[user._id]} className={`px-3 py-1 rounded ${loadingStates.unblock[user._id] ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                {loadingStates.unblock[user._id] ? <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-600" /> : 'Unblock'}
                              </button>
                            ) : (
                              <button onClick={() => { setCurrentUserId(user._id); setShowBlockModal(true); }} disabled={loadingStates.block[user._id]} className={`px-3 py-1 rounded ${loadingStates.block[user._id] ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                                {loadingStates.block[user._id] ? <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-600" /> : 'Block'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && <TableEmpty title="No users found" subtitle="System users will appear here." />}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Reject Member Application</h3>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700"><FiX /></button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">Please provide a reason for rejecting this application:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-sky-200"
                placeholder="Enter reason for rejection..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={closeModals} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg">Cancel</button>
              <button
                onClick={rejectMember}
                disabled={!rejectionReason.trim() || loadingStates.reject[currentMemberId]}
                className={`px-4 py-2 rounded-lg ${(!rejectionReason.trim() || loadingStates.reject[currentMemberId]) ? 'bg-red-100 text-red-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {loadingStates.reject[currentMemberId] ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" /> : 'Confirm Rejection'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Block User Account</h3>
              <button onClick={closeModals} className="text-gray-500 hover:text-gray-700"><FiX /></button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">Please provide a reason for blocking this user:</p>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-sky-200"
                placeholder="Enter reason for blocking..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={closeModals} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg">Cancel</button>
              <button
                onClick={blockUser}
                disabled={!blockReason.trim() || loadingStates.block[currentUserId]}
                className={`px-4 py-2 rounded-lg ${(!blockReason.trim() || loadingStates.block[currentUserId]) ? 'bg-red-100 text-red-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {loadingStates.block[currentUserId] ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" /> : 'Confirm Block'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
