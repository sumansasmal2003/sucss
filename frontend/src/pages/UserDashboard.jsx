import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);
  const [participants, setParticipants] = useState([{ role: '', participantName: '', email: '', phone: '' }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [userData, setUserData] = useState(null);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [subEventDropdownOpen, setSubEventDropdownOpen] = useState(false);
  const [roleDropdownsOpen, setRoleDropdownsOpen] = useState({});
  const [userParticipations, setUserParticipations] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [optionalRolesAvailable, setOptionalRolesAvailable] = useState([]);
  const [compulsoryRoles, setCompulsoryRoles] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [existingParticipants, setExistingParticipants] = useState([]);
  const [selectedParticipation, setSelectedParticipation] = useState(null);
  const [isParticipationModalOpen, setIsParticipationModalOpen] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState({});

  useEffect(() => {
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) setUserData(JSON.parse(userDataStr));
    fetchEvents();
    fetchUserParticipations();
  }, []);

  const api = axios.create({ baseURL: 'http://localhost:5000/api' });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchEvents = async () => {
    try {
      const response = await api.get('/participating-events/open');
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      showMessage(error.response?.data?.message || 'Failed to load events', 'error');
    }
  };

  const fetchUserParticipations = async () => {
    try {
      const res = await api.get('/participations/my');
      // The backend now returns data with event information included
      setUserParticipations(res.data.data || []);
    } catch (err) {
      console.error('Error fetching user participations', err);
      if (err.response?.status === 401) showMessage('Authentication failed. Please login again.', 'error');
    }
  };

  const fetchExistingParticipants = async (eventId) => {
    try {
      const res = await api.get(`/participations/event/${eventId}/participants`);
      setExistingParticipants(res.data.data || []);
    } catch (err) {
      console.error('Error fetching existing participants', err);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => { setMessage(''); setMessageType(''); }, 5000);
  };

  const handleEventSelect = async (event) => {
    setSelectedEvent(event);
    setSelectedSubEvent(null);
    setParticipants([{ role: '', participantName: '', email: '', phone: '' }]);
    setEventDropdownOpen(false);
    setOptionalRolesAvailable([]);
    setCompulsoryRoles([]);

    // Fetch existing participants for this event
    await fetchExistingParticipants(event._id);
  };

  const handleSubEventSelect = (subEvent) => {
    setSelectedSubEvent(subEvent);
    setSubEventDropdownOpen(false);

    const roles = Array.isArray(subEvent.roles) ? subEvent.roles : [];
    const compulsory = roles.filter(r => r.isCompulsory).map(r => r.roleName);
    const optional = roles.filter(r => !r.isCompulsory).map(r => r.roleName);

    setCompulsoryRoles(compulsory);
    setOptionalRolesAvailable(optional);

    const initialParticipants = compulsory.map(role => ({ role, participantName: '', email: '', phone: '' }));
    setParticipants(initialParticipants.length > 0 ? initialParticipants : [{ role: '', participantName: '', email: '', phone: '' }]);
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const toggleRoleDropdown = (index) => {
    setRoleDropdownsOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleRoleSelect = (index, role) => {
    const updated = [...participants];
    const prevRole = updated[index].role;

    if (prevRole && optionalRolesAvailable.indexOf(prevRole) === -1 && !compulsoryRoles.includes(prevRole)) {
      setOptionalRolesAvailable(prev => [...prev, prevRole]);
    }

    updated[index].role = role;
    setParticipants(updated);

    if (!compulsoryRoles.includes(role)) {
      setOptionalRolesAvailable(prev => prev.filter(r => r !== role));
    }

    setRoleDropdownsOpen(prev => ({ ...prev, [index]: false }));
  };

  const addParticipant = () => {
    if (selectedSubEvent && Array.isArray(selectedSubEvent.roles) && selectedSubEvent.roles.length > 0) {
      if (optionalRolesAvailable.length === 0) {
        showMessage('No optional roles left to assign for this sub-event.', 'error');
        return;
      }
    }
    setParticipants(prev => [...prev, { role: '', participantName: '', email: '', phone: '' }]);
  };

  const removeParticipant = (index) => {
    const p = participants[index];
    if (compulsoryRoles.includes(p.role)) {
      showMessage('Cannot remove compulsory role participants.', 'error');
      return;
    }

    const updated = [...participants];
    const removed = updated.splice(index, 1)[0];

    if (removed.role && !compulsoryRoles.includes(removed.role)) {
      setOptionalRolesAvailable(prev => [...prev, removed.role]);
    }

    setParticipants(updated);
    setRoleDropdownsOpen(prev => ({ ...prev, [index]: false }));
  };

  const validateBeforeSubmit = () => {
    if (!selectedSubEvent) { showMessage('Please select a sub-event.', 'error'); return false; }

    for (let role of compulsoryRoles) {
      const found = participants.find(p => p.role === role);
      if (!found) { showMessage(`Compulsory role "${role}" must be assigned.`, 'error'); return false; }
      if (!found.participantName || !found.email || !found.phone) { showMessage(`Fill details for compulsory role "${role}".`, 'error'); return false; }
    }

    for (let p of participants) {
      if (!compulsoryRoles.includes(p.role) && p.role) {
        if (!p.participantName || !p.email || !p.phone) { showMessage('Fill all details for optional participants you added.', 'error'); return false; }
      }
    }

    const emails = participants.map(p => (p.email || '').trim().toLowerCase()).filter(e => e);
    const dup = emails.find((e, i) => emails.indexOf(e) !== i);
    if (dup) { showMessage('Duplicate participant email in the form: ' + dup, 'error'); return false; }

    const assignedRoles = participants.map(p => p.role).filter(r => r);
    const dupRole = assignedRoles.find((r, i) => assignedRoles.indexOf(r) !== i);
    if (dupRole) { showMessage('The role "' + dupRole + '" is assigned multiple times. Each role can be assigned once.', 'error'); return false; }

    // Check if any participant is already registered in this event
    const duplicateParticipants = [];
    participants.forEach(p => {
      if (p.email) {
        const existing = existingParticipants.find(ep =>
          ep.email.toLowerCase() === p.email.toLowerCase() &&
          ep.eventId === selectedEvent._id
        );
        if (existing) {
          duplicateParticipants.push(`${p.participantName} (${p.email})`);
        }
      }
    });

    if (duplicateParticipants.length > 0) {
      showMessage(`The following participants are already registered for this event: ${duplicateParticipants.join(', ')}`, 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedSubEvent) { showMessage('Please select an event and sub-event.', 'error'); return; }
    if (!validateBeforeSubmit()) return;

    setLoading(true);
    try {
      await api.post('/participations', {
        eventId: selectedEvent._id,
        subEventName: selectedSubEvent.subEventName,
        participants
      });

      showMessage('Participation registered successfully!', 'success');
      await fetchUserParticipations();
      await fetchEvents();

      setIsPanelOpen(false);
      setSelectedEvent(null);
      setSelectedSubEvent(null);
      setParticipants([{ role: '', participantName: '', email: '', phone: '' }]);
      setOptionalRolesAvailable([]);
      setCompulsoryRoles([]);
      setRoleDropdownsOpen({});
    } catch (error) {
      console.error('Error registering participation:', error);
      if (error.response?.status === 401) showMessage('Authentication failed. Please login again.', 'error');
      else showMessage(error.response?.data?.message || 'Failed to register participation', 'error');
    } finally { setLoading(false); }
  };

  // Function to open participation details modal
  const openParticipationDetails = (participation) => {
    setSelectedParticipation(participation);
    setIsParticipationModalOpen(true);
  };

  const EventDropdown = () => (
    <div className="relative">
      <button type="button" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center" onClick={() => setEventDropdownOpen(!eventDropdownOpen)}>
        <span>{selectedEvent ? selectedEvent.eventName : 'Choose an event'}</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      <AnimatePresence>
        {eventDropdownOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {events.map(event => (
              <div key={event._id} className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => handleEventSelect(event)}>
                <div className="font-medium">{event.eventName}</div>
                <div className="text-sm text-gray-500">{new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const SubEventDropdown = () => (
    <div className="relative">
      <button type="button" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center" onClick={() => setSubEventDropdownOpen(!subEventDropdownOpen)}>
        <span>{selectedSubEvent ? selectedSubEvent.subEventName : 'Choose a sub-event'}</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      <AnimatePresence>
        {subEventDropdownOpen && selectedEvent && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {selectedEvent.subEvents.map(subEvent => (
              <div key={subEvent.subEventName} className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => handleSubEventSelect(subEvent)}>
                <div className="font-medium">{subEvent.subEventName}</div>
                <div className="text-sm text-gray-500">Max participants: {subEvent.maxParticipants} • {subEvent.roles?.length || 0} roles</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const RoleDropdown = ({ index }) => {
    const p = participants[index] || {};
    const isCompulsory = compulsoryRoles.includes(p.role);

    const assigned = participants.map(x => x.role).filter(Boolean);
    const optionalChoices = (optionalRolesAvailable || []).concat(p.role && !compulsoryRoles.includes(p.role) ? [p.role] : []).filter(Boolean).filter(r => !assigned.includes(r) || r === p.role);

    return (
      <div className="relative">
        <button type="button" className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center ${isCompulsory ? 'opacity-70 cursor-not-allowed' : ''}`} onClick={() => { if (!isCompulsory) toggleRoleDropdown(index); }}>
          <span>{p.role || 'Select a role (optional)'}</span>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>

        <AnimatePresence>
          {roleDropdownsOpen[index] && !isCompulsory && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {optionalChoices.length === 0 && <div className="px-4 py-2 text-sm text-gray-500">No optional roles available</div>}
              {optionalChoices.map(role => (
                <div key={role} className="px-4 py-2 hover:bg-blue-50 cursor-pointer" onClick={() => handleRoleSelect(index, role)}>
                  <div className="font-medium">{role}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleParticipateClick = async (event) => {
    setSelectedEvent(event);
    setSelectedSubEvent(null);
    setParticipants([{ role: '', participantName: '', email: '', phone: '' }]);
    setIsPanelOpen(true);

    // Fetch existing participants for this event
    await fetchExistingParticipants(event._id);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Participation Details Modal Component
  const ParticipationDetailsModal = () => (
    <AnimatePresence>
      {isParticipationModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={() => setIsParticipationModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">Participation Details</h3>
                  <button
                    onClick={() => setIsParticipationModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {selectedParticipation && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Event Information</h4>
                        <p className="text-lg font-medium">{selectedParticipation.eventName}</p>
                        <p className="text-sm text-gray-600">{selectedParticipation.subEventName}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {new Date(selectedParticipation.eventDate).toLocaleDateString()} • {selectedParticipation.eventTime}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Registration Details</h4>
                        <p className="text-sm">Registered on: {new Date(selectedParticipation.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm">Total participants: {selectedParticipation.participants.length}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-800 mb-4 border-b pb-2">Participants</h4>
                      <div className="space-y-4">
                        {selectedParticipation.participants.map((participant, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-lg">{participant.participantName}</p>
                                <p className="text-sm text-gray-600">{participant.role}</p>
                              </div>
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                Participant {index + 1}
                              </span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                </svg>
                                <span>{participant.email}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                                </svg>
                                <span>{participant.phone}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => setIsParticipationModalOpen(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const totalGroupParticipations = userParticipations.length;

  const participationsByEvent = {};
  userParticipations.forEach(participation => {
    // Use event ID for grouping if available, otherwise use event name
    const eventKey = participation.eventId?._id || participation.eventName;

    if (!participationsByEvent[eventKey]) {
      participationsByEvent[eventKey] = {
        eventName: participation.eventName,
        eventId: participation.eventId?._id,
        participations: []
      };
    }
    participationsByEvent[eventKey].participations.push(participation);
  });

  const toggleEventExpansion = (eventId) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 md:p-6 flex flex-col md:flex-row">
      <ParticipationDetailsModal />

      {/* Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-slate-800">Event Participation</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-blue-100 text-blue-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
    {mobileMenuOpen && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="md:hidden bg-white rounded-lg shadow-md p-4 mb-4"
      >
        <h3 className="text-lg font-semibold mb-2">My Participations</h3>
        <p className="text-sm text-gray-600 mb-3">
          Total group participations: <span className="font-bold">{totalGroupParticipations}</span>
        </p>

        <div className="max-h-64 overflow-y-auto">
          {Object.keys(participationsByEvent).length === 0 ? (
    <div className="text-sm text-gray-500">No participations yet.</div>
  ) : (
    Object.entries(participationsByEvent).map(([eventKey, eventData]) => (
      <div key={eventKey} className="mb-3">
        <div
          className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-100 rounded"
          onClick={() => toggleEventExpansion(eventKey)}
        >
          <div className="font-medium text-sm truncate">{eventData.eventName}</div>
          <svg
            className={`w-4 h-4 transition-transform ${expandedEvents[eventKey] ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        <AnimatePresence>
          {expandedEvents[eventKey] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-2 pl-2 border-l border-gray-200"
            >
              {eventData.participations.map((p) => (
                <div
                  key={p._id}
                  className="p-2 my-1 bg-gray-50 rounded cursor-pointer hover:bg-blue-50 transition-colors text-xs"
                  onClick={() => openParticipationDetails(p)}
                >
                  <div className="font-medium">{p.subEventName}</div>
                  <div className="text-gray-500">
                    {p.participants.length} participant{p.participants.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ))
  )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>

      {/* SIDEBAR - Desktop */}
      <aside className="hidden md:block w-80 mr-6">
    <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 shadow-md sticky top-6">
      <h3 className="text-lg font-semibold mb-2">My Participations</h3>
      <p className="text-sm text-gray-600 mb-3">
        Total group participations: <span className="font-bold">{totalGroupParticipations}</span>
      </p>

      <div className="mt-4 max-h-96 overflow-y-auto">
        {Object.keys(participationsByEvent).length === 0 ? (
    <div className="text-sm text-gray-500 p-2">No participations yet.</div>
  ) : (
    Object.entries(participationsByEvent).map(([eventKey, eventData]) => (
      <div key={eventKey} className="mb-3">
        <div
          className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
          onClick={() => toggleEventExpansion(eventKey)}
        >
          <div className="font-medium text-sm truncate flex items-center justify-center gap-4">
            <p>{eventData.eventName}</p>
            <div className='bg-zinc-800 text-white w-4 h-4 rounded flex items-center justify-center'>
              <p className='text-xs'>{eventData.participations.length}</p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${expandedEvents[eventKey] ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        <AnimatePresence>
          {expandedEvents[eventKey] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-3 pl-2 border-l border-gray-200 mt-1"
            >
              {eventData.participations.map((p) => (
                <div
                  key={p._id}
                  className="p-2 my-1 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => openParticipationDetails(p)}
                >
                  <div className="font-medium text-sm">{p.subEventName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.participants.length} participant{p.participants.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ))
  )}
      </div>
    </div>
  </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1">
        {/* Header */}
        {userData && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 shadow-md mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-3 md:mb-0">
              <h2 className="text-xl font-bold text-slate-800">Welcome, {userData.fullName}</h2>
              <p className="text-slate-600">{userData.email}</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{userData.role}</div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Available Events</h1>
                <p className="text-slate-600">Click Participate to register for an event</p>
              </div>
            </div>
          </div>

          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-lg border ${messageType === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
              <div className="flex items-center">
                {messageType === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                )}
                {message}
              </div>
            </motion.div>
          )}

          <div className="grid gap-4">
            {events.map(ev => (
              <div key={ev._id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-2 sm:mb-0">
                  <div className="font-medium">{ev.eventName}</div>
                  <div className="text-sm text-gray-500">{new Date(ev.eventDate).toLocaleDateString()} • {ev.eventTime}</div>
                </div>
                <button
                  onClick={() => handleParticipateClick(ev)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto text-center"
                >
                  Participate
                </button>
              </div>
            ))}
            {events.length === 0 && <div className="text-sm text-gray-500">No open events available.</div>}
          </div>
        </motion.div>
      </div>

      {/* PARTICIPATION PANEL */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 md:hidden"
              onClick={() => setIsPanelOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed right-0 top-0 h-full w-full md:w-[520px] bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Register Participation</h3>
                  <button onClick={() => setIsPanelOpen(false)} className="text-gray-500 p-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Selected Event</label>
                    <div className="p-3 border rounded-lg bg-gray-50">{selectedEvent?.eventName || '—'}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Sub-event</label>
                    <SubEventDropdown />
                  </div>

                  {selectedSubEvent && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">Participants</h4>
                        <button type="button" onClick={addParticipant} className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                          Add
                        </button>
                      </div>

                      {participants.map((participant, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-50 p-4 rounded-lg mb-4 relative border border-slate-200"
                        >
                          {!compulsoryRoles.includes(participant.role) && participants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeParticipant(index)}
                              className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          )}

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                              <RoleDropdown index={index} />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Participant Name</label>
                              <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                value={participant.participantName}
                                onChange={(e) => handleParticipantChange(index, 'participantName', e.target.value)}
                                required={compulsoryRoles.includes(participant.role)}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                              <input
                                type="email"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                value={participant.email}
                                onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                                required={compulsoryRoles.includes(participant.role)}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                              <input
                                type="tel"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                value={participant.phone}
                                onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                                required={compulsoryRoles.includes(participant.role)}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm disabled:opacity-50 font-medium flex justify-center items-center"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registering...
                          </>
                        ) : 'Register Participation'}
                      </motion.button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
