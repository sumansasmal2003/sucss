// src/pages/Member.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiSearch, FiUser, FiPhone, FiMail, FiAward, FiCalendar, FiFilter } from 'react-icons/fi';

const Member = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch members from API
  useEffect(() => {
    let mounted = true;
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/auth/public/members/approved'); // change to full URL if needed
        if (!mounted) return;
        setMembers(response.data || []);
      } catch (err) {
        console.error('Error fetching members:', err);
        if (!mounted) return;
        setError('Failed to load members. Please try again later.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMembers();
    return () => { mounted = false; };
  }, []);

  // Derived list: filter + sort (keeps logic in one place and avoids multiple effects)
  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = members.slice();

    if (term) {
      list = list.filter((member) => {
        return (
          (member.fullName || '').toLowerCase().includes(term) ||
          (member.memberId || '').toLowerCase().includes(term) ||
          (member.designation || '').toLowerCase().includes(term)
        );
      });
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.approvedAt || b.createdAt) - new Date(a.approvedAt || a.createdAt));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.approvedAt || a.createdAt) - new Date(b.approvedAt || b.createdAt));
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    }

    return list;
  }, [members, searchTerm, sortBy]);

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ').filter(Boolean);
    const first = names[0]?.charAt(0) || '';
    const last = names.length > 1 ? names[names.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400 mb-4"></div>
        <p className="text-slate-600">Loading members...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 p-6 rounded-2xl shadow-lg max-w-md text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Unable to load members</h2>
        <p className="text-slate-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold shadow-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Sijgeria Umesh Chandra Smriti Sangha</h1>
          <p className="text-lg text-slate-600 font-medium">Approved Members Directory</p>
          <div className="w-20 h-1 bg-gradient-to-r from-sky-600 to-indigo-600 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search members by name, ID or designation..."
              className="block w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="h-5 w-5 text-slate-400" />
              </div>
              <select
                className="block w-full md:w-auto pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Member Count */}
        <div className="bg-white/80 rounded-xl p-4 mb-6 border border-gray-200 backdrop-blur-sm">
          <p className="text-slate-700">
            Showing <span className="font-semibold text-sky-600">{filteredMembers.length}</span> of <span className="font-semibold text-sky-600">{members.length}</span> approved members
          </p>
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-white/80 rounded-xl border border-gray-200 backdrop-blur-sm">
            <div className="mx-auto h-24 w-24 rounded-full bg-sky-50 flex items-center justify-center mb-6">
              <FiUser className="h-12 w-12 text-sky-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No members found</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {searchTerm ? `No members match your search for "${searchTerm}"` : 'There are no approved members to display'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28 }}
                className="bg-white/90 rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-sky-600 to-indigo-600 h-28 relative">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <div className="bg-white rounded-full p-1 shadow-lg">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center border-4 border-white">
                        <span className="text-2xl font-bold text-white">{getInitials(member.fullName)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="pt-12 pb-6 px-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{member.fullName}</h3>
                    <div className="flex items-center justify-center">
                      <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-gray-100">
                        {member.designation}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="bg-slate-50 rounded-lg p-2 mr-3">
                        <FiAward className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Member ID</p>
                        <p className="font-medium text-slate-900">{member.memberId}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-slate-50 rounded-lg p-2 mr-3">
                        <FiMail className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium text-slate-900 truncate max-w-[18rem]">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-slate-50 rounded-lg p-2 mr-3">
                        <FiPhone className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium text-slate-900">{member.phone || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-slate-50 rounded-lg p-2 mr-3">
                        <FiCalendar className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Approved On</p>
                        <p className="font-medium text-slate-900">{member.approvedAt ? format(new Date(member.approvedAt), 'dd MMM yyyy') : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Member;
