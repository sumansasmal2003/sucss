// src/pages/UploadEvents.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiCalendar, FiUpload, FiInfo, FiClock } from 'react-icons/fi';

const UploadEvents = () => {
  const { memberData } = useOutletContext();
  const [formData, setFormData] = useState({
    eventName: '',
    date: '',
    time: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.eventName.trim() || !formData.date || !formData.time || !formData.description.trim()) {
        throw new Error('Please fill out all fields before submitting.');
      }

      setLoading(true);

      // Combine date + time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

      const payload = {
        eventName: formData.eventName.trim(),
        description: formData.description.trim(),
        eventDateTime,
        memberId: memberData?.memberId,
        memberName: memberData?.fullName
      };

      const token = localStorage.getItem('token');

      // Use relative API path - change to full URL if your backend runs on a different host
      await axios.post('http://localhost:5000/api/events', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      setFormData({ eventName: '', date: '', time: '', description: '' });
      setSuccess('Event created successfully!');
    } catch (err) {
      console.error('Event creation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
            <FiCalendar size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create New Event</h1>
            <p className="text-slate-600 mt-1">Share upcoming events with the community. All fields are required.</p>
          </div>
        </div>
      </div>

      {/* Status */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <div className="p-2 rounded-full bg-red-100">
            <FiInfo />
          </div>
          <div className="text-sm">{error}</div>
        </motion.div>
      )}

      {success && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-100">
            <FiInfo />
          </div>
          <div className="text-sm">{success}</div>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white/90 rounded-2xl border border-gray-200 shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-slate-700 mb-2">Event Name</label>
            <input
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              placeholder="Enter event name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-2">Time</label>
              <input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Event Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the event details, location, and any special instructions..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-sky-50 text-sky-600">
                <FiClock />
              </div>
              <span>Event time will be shown in local timezone</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md hover:scale-[1.02]'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <FiUpload />
                Create Event
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default UploadEvents;
