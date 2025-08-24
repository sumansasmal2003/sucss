import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiCalendar, FiClock, FiX, FiPlus, FiTrash2, FiCheck, FiAlertCircle,
  FiEdit, FiUsers, FiEye, FiArrowRight, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '../utils/auth';

const ParticipatingEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [events, setEvents] = useState([]);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);

  const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  // Form state
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    registrationClosing: '',
    subEvents: [{
      subEventName: '',
      maxParticipants: 1,
      roles: [{ id: genId(), roleName: '', isCompulsory: false }],
      description: ''
    }]
  });

  // Fetch existing events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get('https://sucss.onrender.com/api/participating-events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle event date change and automatically set registration closing
  const handleEventDateChange = (e) => {
    const eventDate = e.target.value;
    setFormData(prev => {
      const registrationClosing = eventDate ?
        new Date(new Date(eventDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';

      return {
        ...prev,
        eventDate,
        registrationClosing
      };
    });
  };

  const handleDeleteEvent = async (eventId) => {
    const ok = window.confirm('Are you sure you want to delete this event and all its participants? This action is irreversible.');
    if (!ok) return;

    setError('');
    setSuccess('');
    setDeletingEventId(eventId);

    try {
      const token = getAuthToken();
      const response = await axios.delete(`https://sucss.onrender.com/api/participating-events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(response.data?.message || 'Event deleted successfully');
      setEvents(prev => prev.filter(ev => ev._id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeletingEventId(null);
    }
  };

  const toggleEventExpand = (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(eventId);
    }
  };

  // Add a new sub-event
  const addSubEvent = () => {
    setFormData(prev => ({
      ...prev,
      subEvents: [
        ...prev.subEvents,
        {
          subEventName: '',
          maxParticipants: 1,
          roles: [{ id: genId(), roleName: '', isCompulsory: false }],
          description: ''
        }
      ]
    }));
  };

  // Remove a sub-event
  const removeSubEvent = (index) => {
    setFormData(prev => ({
      ...prev,
      subEvents: prev.subEvents.filter((_, i) => i !== index)
    }));
  };

  // Handle sub-event input changes
  const handleSubEventChange = (index, field, value) => {
    setFormData(prev => {
      const newSubEvents = [...prev.subEvents];
      newSubEvents[index][field] = value;
      return { ...prev, subEvents: newSubEvents };
    });
  };

  // Add a role to a sub-event
  const addRole = (subEventIndex) => {
    setFormData(prev => {
      const newSubEvents = prev.subEvents.map((se, i) => {
        if (i !== subEventIndex) return se;
        return {
          ...se,
          roles: [...se.roles, { id: genId(), roleName: '', isCompulsory: false }]
        };
      });
      return { ...prev, subEvents: newSubEvents };
    });
  };

  // Remove a role from a sub-event
  const removeRole = (subEventIndex, roleIndex) => {
    setFormData(prev => {
      const newSubEvents = prev.subEvents.map((se, i) => {
        if (i !== subEventIndex) return se;
        return {
          ...se,
          roles: se.roles.filter((_, rI) => rI !== roleIndex)
        };
      });
      return { ...prev, subEvents: newSubEvents };
    });
  };

  // Handle role input changes
  const handleRoleChange = (subEventIndex, roleIndex, field, value) => {
    setFormData(prev => {
      const newSubEvents = prev.subEvents.map((se, i) => {
        if (i !== subEventIndex) return se;
        return {
          ...se,
          roles: se.roles.map((r, ri) => ri === roleIndex ? { ...r, [field]: value } : r)
        };
      });
      return { ...prev, subEvents: newSubEvents };
    });
  };

  // Toggle compulsory status of a role
  const toggleCompulsory = (subEventIndex, roleIndex) => {
    setFormData(prev => {
      const newSubEvents = prev.subEvents.map((se, i) => {
        if (i !== subEventIndex) return se;
        return {
          ...se,
          roles: se.roles.map((r, ri) => ri === roleIndex ? { ...r, isCompulsory: !r.isCompulsory } : r)
        };
      });
      return { ...prev, subEvents: newSubEvents };
    });
  };

  // Validate form
  const validateForm = () => {
    if (!formData.eventName.trim()) {
      setError('Event name is required');
      return false;
    }

    if (!formData.eventDate) {
      setError('Event date is required');
      return false;
    }

    if (new Date(formData.eventDate) <= new Date()) {
      setError('Event date must be in the future');
      return false;
    }

    if (!formData.eventTime) {
      setError('Event time is required');
      return false;
    }

    if (formData.subEvents.length === 0) {
      setError('At least one sub-event is required');
      return false;
    }

    for (let i = 0; i < formData.subEvents.length; i++) {
      const subEvent = formData.subEvents[i];

      if (!subEvent.subEventName.trim()) {
        setError(`Sub-event name is required for sub-event ${i + 1}`);
        return false;
      }

      if (subEvent.roles.length === 0) {
        setError(`At least one role is required for ${subEvent.subEventName}`);
        return false;
      }

      const hasCompulsoryRole = subEvent.roles.some(role => role.isCompulsory);
      if (!hasCompulsoryRole) {
        setError(`At least one compulsory role is required for ${subEvent.subEventName}`);
        return false;
      }

      for (let j = 0; j < subEvent.roles.length; j++) {
        if (!subEvent.roles[j].roleName.trim()) {
          setError(`Role name is required for role ${j + 1} in ${subEvent.subEventName}`);
          return false;
        }
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = getAuthToken();
      await axios.post('https://sucss.onrender.com/api/participating-events', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Event created successfully!');
      setFormData({
        eventName: '',
        eventDate: '',
        eventTime: '',
        registrationClosing: '',
        subEvents: [{
          subEventName: '',
          maxParticipants: 1,
          roles: [{ roleName: '', isCompulsory: false }],
          description: ''
        }]
      });

      // Refresh events list
      fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`;
  };

  return (
    <div className="min-h-screen py-8 px-1 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create Participating Event</h1>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <FiCalendar className="text-indigo-600 text-xl" />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-center"
              >
                <FiAlertCircle className="mr-3 text-xl" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 flex items-center"
              >
                <FiCheck className="mr-3 text-xl" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Event Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleEventDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 transition"
                    required
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiCalendar className="text-gray-400 text-xl" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Time *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="eventTime"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 transition"
                    required
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FiClock className="text-gray-400 text-xl" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="registrationClosing" className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Closing Date
                </label>
                <input
                  type="date"
                  id="registrationClosing"
                  name="registrationClosing"
                  value={formData.registrationClosing}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  max={formData.eventDate ? new Date(new Date(formData.eventDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] : ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-2">
                  Automatically set to one day before the event
                </p>
              </div>
            </div>

            {/* Sub Events */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Sub Events</h2>
                <button
                  type="button"
                  onClick={addSubEvent}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
                >
                  <FiPlus className="mr-2" />
                  Add Sub Event
                </button>
              </div>

              {formData.subEvents.map((subEvent, subEventIndex) => (
                <div key={subEventIndex} className="bg-gray-50 p-2 md:p-6 rounded-2xl mb-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900 text-lg">Sub Event #{subEventIndex + 1}</h3>
                    {formData.subEvents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubEvent(subEventIndex)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub Event Name *
                      </label>
                      <input
                        type="text"
                        value={subEvent.subEventName}
                        onChange={(e) => handleSubEventChange(subEventIndex, 'subEventName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Enter sub event name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Participants *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={subEvent.maxParticipants}
                        onChange={(e) => handleSubEventChange(subEventIndex, 'maxParticipants', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={subEvent.description}
                      onChange={(e) => handleSubEventChange(subEventIndex, 'description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      rows="3"
                      placeholder="Enter description (optional)"
                    />
                  </div>

                  {/* Roles */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Roles</h4>
                      <button
                        type="button"
                        onClick={() => addRole(subEventIndex)}
                        className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition"
                      >
                        <FiPlus className="mr-1" size={14} />
                        Add Role
                      </button>
                    </div>

                    {subEvent.roles.map((role, roleIndex) => (
                      <div key={roleIndex} className="flex items-center mb-3 gap-2">
                        <input
                          type="text"
                          value={role.roleName}
                          onChange={(e) => handleRoleChange(subEventIndex, roleIndex, 'roleName', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          placeholder="Role name"
                          required
                        />

                        <label className="flex items-center bg-white px-3 py-2 rounded-xl border border-gray-300">
                          <input
                            type="checkbox"
                            checked={role.isCompulsory}
                            onChange={() => toggleCompulsory(subEventIndex, roleIndex)}
                            className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Compulsory</span>
                        </label>

                        {subEvent.roles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRole(subEventIndex, roleIndex)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Event...
                  </>
                ) : (
                  <>
                    Create Event
                    <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.section>

        {/* Existing Events List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Participating Events</h2>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
              {events.length} {events.length === 1 ? 'Event' : 'Events'}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <FiCalendar className="text-indigo-500 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Create your first participating event to get started. Your events will appear here once created.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event._id} className="border border-gray-200 rounded-2xl overflow-hidden transition-all hover:shadow-lg">
                  <div className="bg-white p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{event.eventName}</h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <FiCalendar className="mr-2 text-indigo-500" />
                            <span>{formatDate(event.eventDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <FiClock className="mr-2 text-indigo-500" />
                            <span>{formatTime(event.eventTime)}</span>
                          </div>
                          <div className="flex items-center">
                            <FiUsers className="mr-2 text-indigo-500" />
                            <span>{event.subEvents.reduce((total, se) => total + se.maxParticipants, 0)} max participants</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                          Registration closes: {formatDate(event.registrationClosing)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEventExpand(event._id)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          aria-label={expandedEventId === event._id ? "Collapse details" : "Expand details"}
                        >
                          {expandedEventId === event._id ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(event._id)}
                          disabled={deletingEventId === event._id}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete event"
                        >
                          {deletingEventId === event._id ? (
                            <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedEventId === event._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FiEye className="mr-2 text-indigo-500" />
                            Event Details
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Sub Events</h5>
                              <ul className="space-y-2">
                                {event.subEvents.map((subEvent, index) => (
                                  <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <span className="text-sm font-medium text-gray-800">{subEvent.subEventName}</span>
                                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                      {subEvent.maxParticipants} participants
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Roles Overview</h5>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                {event.subEvents.map((subEvent, index) => (
                                  <div key={index} className="mb-2 last:mb-0">
                                    <p className="text-xs font-medium text-gray-700 mb-1">{subEvent.subEventName}:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {subEvent.roles.map((role, rIndex) => (
                                        <span
                                          key={rIndex}
                                          className={`text-xs px-2 py-1 rounded-full ${role.isCompulsory ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                                        >
                                          {role.roleName} {role.isCompulsory && '(Required)'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                              <FiEdit className="mr-1" />
                              Edit Event
                            </button>
                            <button className="flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium">
                              View Participants
                              <FiArrowRight className="ml-1" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default ParticipatingEvent;
