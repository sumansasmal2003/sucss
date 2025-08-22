import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiX, FiRefreshCw, FiChevronLeft, FiChevronRight,
  FiUsers, FiAward, FiAlertCircle, FiLoader, FiEye
} from 'react-icons/fi';

const safeDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

// Mobile Card Component
const UserCard = ({ record, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-4"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <FiUser className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{record?.user?.fullName ?? '—'}</h3>
              <p className="text-sm text-gray-500">{record?.user?.email ?? '—'}</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FiUsers className="mr-1 h-3 w-3" />
            {record?.totalParticipants ?? '0'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FiPhone className="h-4 w-4 text-gray-400 mr-1" />
            <span>{record?.user?.mobile ?? '—'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiMail className="h-4 w-4 text-gray-400 mr-1" />
            <span className="truncate">{record?.user?.email ?? '—'}</span>
          </div>
        </div>

        <button
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center"
          onClick={() => onClick(record)}
        >
          <FiEye className="mr-2 h-4 w-4" />
          View Details
        </button>
      </div>
    </motion.div>
  );
};

const UserRecords = () => {
  const [userRecords, setUserRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  const fetchUserRecords = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token') || '';
      const response = await axios.get(`http://localhost:5000/api/participations/users/records?page=${page}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const data = response?.data?.data || [];
      const pag = response?.data?.pagination || { current: page, pages: 1, total: data.length };

      setUserRecords(Array.isArray(data) ? data : []);
      setPagination({
        current: pag.current ?? page,
        pages: pag.pages ?? 1,
        total: pag.total ?? (Array.isArray(data) ? data.length : 0),
      });
    } catch (err) {
      console.error('Error fetching user records:', err);
      const msg = err?.response?.data?.message || 'Failed to fetch user records';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRecords(1);
  }, []);

  const openUserDetails = (record) => {
    setSelectedUser(record);
    document.body.style.overflow = 'hidden';
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    document.body.style.overflow = '';
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages && page !== pagination.current) {
      fetchUserRecords(page);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-lg"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <FiLoader className="h-12 w-12 text-blue-500" />
          </motion.div>
          <p className="text-gray-600 font-medium">Loading user records...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full"
        >
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-red-100 mr-3">
              <FiAlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Data</h3>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            onClick={() => fetchUserRecords(1)}
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">User Participation Records</h1>
            <p className="opacity-90 mt-2">Manage and view user participation data</p>
          </div>

          {userRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="p-4 rounded-full bg-blue-100 mb-4">
                <FiUsers className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-500 mb-6 text-center">There are no user participation records to display at this time.</p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                onClick={() => fetchUserRecords(1)}
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table (hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">User Name</th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">Email</th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">Mobile</th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">Participants</th>
                      <th className="py-4 px-6 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userRecords.map((record, index) => {
                      const id = record?.user?._id ?? record?._id ?? Math.random();
                      return (
                        <motion.tr
                          key={id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <FiUser className="h-5 w-5 text-blue-500" />
                              </div>
                              <span className="font-medium text-gray-900">{record?.user?.fullName ?? '—'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">{record?.user?.email ?? '—'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <FiPhone className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">{record?.user?.mobile ?? '—'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              <FiUsers className="mr-1 h-4 w-4" />
                              {record?.totalParticipants ?? '0'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                              onClick={() => openUserDetails(record)}
                            >
                              View Details
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (shown on mobile) */}
              <div className="md:hidden p-4">
                {userRecords.map((record, index) => (
                  <UserCard
                    key={record?.user?._id ?? record?._id ?? index}
                    record={record}
                    index={index}
                    onClick={openUserDetails}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{pagination.current}</span> of{' '}
                      <span className="font-medium">{pagination.pages}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => goToPage(pagination.current - 1)}
                        disabled={pagination.current === 1}
                        className="flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronLeft className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.current <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.current >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i;
                          } else {
                            pageNum = pagination.current - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                pagination.current === pageNum
                                  ? 'bg-blue-500 text-white'
                                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => goToPage(pagination.current + 1)}
                        disabled={pagination.current === pagination.pages}
                        className="flex items-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <FiChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 z-50"
              onClick={closeUserDetails}
            />
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white flex justify-between items-center">
                  <h2 className="text-xl font-bold">User Details</h2>
                  <button
                    onClick={closeUserDetails}
                    className="p-1 rounded-full hover:bg-blue-400 transition-colors"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                <div className="overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FiUser className="mr-2 text-blue-500" />
                        User Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                          <span><strong>Name:</strong> {selectedUser?.user?.fullName ?? '—'}</span>
                        </div>
                        <div className="flex items-center">
                          <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                          <span><strong>Email:</strong> {selectedUser?.user?.email ?? '—'}</span>
                        </div>
                        <div className="flex items-center">
                          <FiPhone className="h-4 w-4 text-gray-400 mr-2" />
                          <span><strong>Mobile:</strong> {selectedUser?.user?.mobile ?? '—'}</span>
                        </div>
                        <div className="flex items-center">
                          <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                          <span><strong>Username:</strong> {selectedUser?.user?.username ?? '—'}</span>
                        </div>
                        <div className="flex items-center">
                          <FiMapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span><strong>Address:</strong> {selectedUser?.user?.address ?? '—'}</span>
                        </div>
                        <div className="flex items-center">
                          <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span><strong>Joined:</strong> {safeDate(selectedUser?.user?.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <FiAward className="mr-2 text-blue-500" />
                        Participation Summary
                      </h3>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                              {selectedUser?.totalParticipants ?? '0'}
                            </div>
                            <div className="text-gray-600">Total Participants</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiCalendar className="mr-2 text-blue-500" />
                      Participation History
                    </h3>

                    {(selectedUser?.participations?.length ?? 0) === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No participation records found
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedUser.participations.map((participation) => (
                          <motion.div
                            key={participation?._id ?? Math.random()}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-blue-600">
                                {participation?.eventId?.eventName ??
                                  participation?.eventName ??
                                  'Unknown Event'}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {safeDate(participation?.eventId?.eventDate)}
                              </span>
                            </div>

                            {participation?.subEventName && (
                              <div className="text-sm text-gray-600 mb-3">
                                <strong>Sub-event:</strong> {participation.subEventName}
                              </div>
                            )}

                            <div className="mt-3">
                              <h5 className="font-medium mb-2 flex items-center">
                                <FiUsers className="mr-1 h-4 w-4" />
                                Participants:
                              </h5>

                              {Array.isArray(participation?.participants) &&
                              participation.participants.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {participation.participants.map((p, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                      <div className="font-medium text-gray-900">{p?.participantName ?? '—'}</div>
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium">Role:</span> {p?.role ?? '—'}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium">Email:</span> {p?.email ?? '—'}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <span className="font-medium">Phone:</span> {p?.phone ?? '—'}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 text-sm">No participants listed</div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
                  <button
                    onClick={closeUserDetails}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserRecords;
