import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiClock, FiX, FiPlus, FiTrash2, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '../utils/auth';

const ParticipatingEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [events, setEvents] = useState([]);

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
      const response = await axios.get('http://localhost:5000/api/participating-events', {
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
      await axios.post('http://localhost:5000/api/participating-events', formData, {
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
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-md"
      >
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Participating Event</h1>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center"
            >
              <FiAlertCircle className="mr-2" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center"
            >
              <FiCheck className="mr-2" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Event Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-slate-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Enter event name"
                required
              />
            </div>

            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pl-10"
                  required
                />
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="eventTime" className="block text-sm font-medium text-slate-700 mb-2">
                Event Time *
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="eventTime"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pl-10"
                  required
                />
                <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="registrationClosing" className="block text-sm font-medium text-slate-700 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-gray-50"
                readOnly
              />
              <p className="text-xs text-slate-500 mt-1">
                Automatically set to one day before the event
              </p>
            </div>
          </div>

          {/* Sub Events */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-slate-900">Sub Events</h2>
              <button
                type="button"
                onClick={addSubEvent}
                className="flex items-center px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
              >
                <FiPlus className="mr-1" />
                Add Sub Event
              </button>
            </div>

            {formData.subEvents.map((subEvent, subEventIndex) => (
              <div key={subEventIndex} className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-slate-900">Sub Event #{subEventIndex + 1}</h3>
                  {formData.subEvents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubEvent(subEventIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sub Event Name *
                    </label>
                    <input
                      type="text"
                      value={subEvent.subEventName}
                      onChange={(e) => handleSubEventChange(subEventIndex, 'subEventName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="Enter sub event name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Max Participants *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={subEvent.maxParticipants}
                      onChange={(e) => handleSubEventChange(subEventIndex, 'maxParticipants', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={subEvent.description}
                    onChange={(e) => handleSubEventChange(subEventIndex, 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    rows="2"
                    placeholder="Enter description (optional)"
                  />
                </div>

                {/* Roles */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-slate-900">Roles</h4>
                    <button
                      type="button"
                      onClick={() => addRole(subEventIndex)}
                      className="flex items-center px-2 py-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 text-sm"
                    >
                      <FiPlus className="mr-1" size={14} />
                      Add Role
                    </button>
                  </div>

                  {subEvent.roles.map((role, roleIndex) => (
                    <div key={roleIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={role.roleName}
                        onChange={(e) => handleRoleChange(subEventIndex, roleIndex, 'roleName', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 mr-2"
                        placeholder="Role name"
                        required
                      />

                      <label className="flex items-center mr-2">
                        <input
                          type="checkbox"
                          checked={role.isCompulsory}
                          onChange={() => toggleCompulsory(subEventIndex, roleIndex)}
                          className="mr-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-slate-700">Compulsory</span>
                      </label>

                      {subEvent.roles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRole(subEventIndex, roleIndex)}
                          className="text-red-500 hover:text-red-700 p-2"
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
              className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </motion.section>

      {/* Existing Events List */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-md"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6">Your Participating Events</h2>

        {events.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No events created yet</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{event.eventName}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {formatDate(event.eventDate)} at {event.eventTime}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Registration closes: {formatDate(event.registrationClosing)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.status === 'active' ? 'bg-green-100 text-green-800' :
                    event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Sub Events:</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.subEvents.map((subEvent, index) => (
                      <span key={index} className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-700">
                        {subEvent.subEventName} ({subEvent.maxParticipants} participants)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default ParticipatingEvent;
