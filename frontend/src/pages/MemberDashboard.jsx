import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAuth, getAuthToken } from '../utils/auth';
import axios from 'axios';
import {
  FiLogOut, FiUser, FiCalendar, FiAward, FiMenu, FiX,
  FiSettings, FiBell, FiHome, FiMessageSquare, FiHeart, FiSearch,
  FiUsers
} from 'react-icons/fi';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [participatingEvents, setParticipatingEvents] = useState([]);
  const [allParticipatingEvents, setAllParticipatingEvents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Check authentication status
  useEffect(() => {
    const token = getAuthToken();
    if (!token) navigate('/login');
  }, [navigate]);

  // Fetch member data
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = getAuthToken();
        const response = await axios.get('https://sucss.onrender.com/api/auth/member/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMemberData(response.data);
      } catch (err) {
        console.error('Error fetching member data:', err);
        setError('Failed to load member data. Please try again later.');
        if (err.response && err.response.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchMemberData();
  }, [navigate]);

  // Fetch events and participating events data
  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        const token = getAuthToken();

        // Fetch ALL events (not just the ones created by this member)
        const eventsResponse = await axios.get('https://sucss.onrender.com/api/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(eventsResponse.data);

        // Fetch participating events created by this member
        const participatingResponse = await axios.get('https://sucss.onrender.com/api/participating-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setParticipatingEvents(participatingResponse.data.data || []);

        // Fetch ALL participating events (not just the ones created by this member)
        const allParticipatingResponse = await axios.get('https://sucss.onrender.com/api/participating-events/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllParticipatingEvents(allParticipatingResponse.data.data || []);

        // Filter events created by the logged-in member for recent activities
        const memberEvents = eventsResponse.data.filter(event =>
          event.createdBy === memberData?._id || event.creatorId === memberData?._id
        );

        // Get participating events for the member
        const memberParticipatingEvents = participatingResponse.data.data || [];

        // Create activities for created events
        const createdActivities = memberEvents.map(event => ({
          type: 'event_created',
          title: 'Event Created',
          subtitle: `You created the event: ${event.title || event.eventName}`,
          date: event.createdAt,
          icon: <FiCalendar />
        }));

        // Create activities for participating events
        const participatingActivities = memberParticipatingEvents.map(event => ({
          type: 'event_participation',
          title: 'Event Participation',
          subtitle: `You registered for: ${event.eventName}`,
          date: event.createdAt || event.registrationDate,
          icon: <FiAward />
        }));

        // Combine and sort activities by date
        const allActivities = [...createdActivities, ...participatingActivities]
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setRecentActivities(allActivities);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    if (memberData) {
      fetchEventsData();
    }
  }, [memberData]);

  console.log(participatingEvents)

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400 mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 p-6 rounded-2xl shadow-lg max-w-md text-center">
          <div className="text-red-500 mb-4">
            {/* <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round", strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg> */}
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-lg shadow-sm hover:scale-[1.01] transition-all"
            >
              Try Again
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-transparent border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const CustomNavLink = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <NavLink
        to={to}
        className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
          isActive
            ? 'bg-sky-50 text-sky-700 font-medium border-r-4 border-sky-300'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <Icon className={`mr-3 ${isActive ? 'text-sky-500' : 'text-slate-400 group-hover:text-sky-600'}`} size={20} />
        <span>{label}</span>
        {isActive && <div className="ml-auto w-2 h-2 bg-sky-500 rounded-full"></div>}
      </NavLink>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-slate-900 overflow-hidden relative">
      {/* Subtle background blobs to echo landing page */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-sky-200/30 to-indigo-200/10 blur-3xl" />
        <div className="absolute right-[-120px] top-28 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-300/30 to-sky-100/10 blur-2xl" />
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          className="p-2 bg-white/70 backdrop-blur-md rounded-lg border border-gray-200 text-slate-700 hover:shadow-sm focus:outline-none"
        >
          {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        className="hidden md:flex md:fixed md:inset-y-0 md:left-0 z-40 w-64 min-h-screen bg-white/70 backdrop-blur-xl border-r border-gray-200 flex-col shadow-lg overflow-y-auto"
        aria-label="Sidebar"
      >
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3">
              <FiHome size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Member Portal</h1>
              <p className="text-xs text-slate-500 mt-1">Sijgeria Umesh Chandra Smriti Sangha</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3">
          <nav className="space-y-1">
            <CustomNavLink to="/member/dashboard" icon={FiUser} label="My Profile" />
            <CustomNavLink to="/member/dashboard/upload-events" icon={FiCalendar} label="Upload Events" />
            <CustomNavLink to="/member/dashboard/upload-participating-events" icon={FiAward} label="Participating Events" />
            <CustomNavLink to="/member/dashboard/users/records" icon={FiUsers} label="User Records" />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 flex items-center justify-center text-white font-semibold mr-3">
              {memberData?.fullName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{memberData?.fullName}</p>
              <p className="text-xs text-slate-500">{memberData?.designation}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-transparent border border-gray-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            aria-label="Log out"
            >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (animated) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            ref={sidebarRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-40 w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200 h-full flex flex-col md:hidden shadow-xl left-0"
            aria-label="Mobile sidebar"
          >
            <div className="p-5 border-b border-gray-100 ml-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <h1 className="text-lg font-bold text-slate-900">Member Portal</h1>
                    <p className="text-xs text-slate-500">Sijgeria Umesh Chandra Smriti Sangha</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-5 px-3">
              <nav className="space-y-1">
                <CustomNavLink to="/member/dashboard" icon={FiUser} label="My Profile" />
                <CustomNavLink to="/member/dashboard/upload-events" icon={FiCalendar} label="Upload Events" />
                <CustomNavLink to="/member/dashboard/upload-participating-events" icon={FiAward} label="Participating Events" />
                <CustomNavLink to="/member/dashboard/users/records" icon={FiUsers} label="User Records" />
              </nav>
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 flex items-center justify-center text-white font-semibold mr-3">{memberData?.fullName?.[0]?.toUpperCase() ?? '?'}</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{memberData?.fullName}</p>
                  <p className="text-xs text-slate-500">{memberData?.designation}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 bg-transparent border border-gray-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-transparent backdrop-blur-md bg-opacity-5 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Topbar */}
        <header className="bg-white/60 backdrop-blur-sm border-b border-gray-100 md:hidden">
          <div className="flex justify-between items-center p-4 max-w-6xl mx-auto w-full">
            <div className="md:hidden ml-12">
              <h1 className="text-lg font-semibold text-slate-900">Member Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="text-right hidden md:block mr-3">
                  <p className="font-medium text-slate-900 truncate max-w-[160px]">{memberData?.fullName}</p>
                  <p className="text-sm text-slate-500 truncate max-w-[160px]">{memberData?.designation}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 flex items-center justify-center text-white font-semibold">{memberData?.fullName?.[0]?.toUpperCase() ?? '?'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Outlet context={{ memberData }} />

          {location.pathname === '/member/dashboard' && (
            <MemberProfile
              memberData={memberData}
              events={events}
              participatingEvents={participatingEvents}
              allParticipatingEvents={allParticipatingEvents}
              recentActivities={recentActivities}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// MemberProfile component
const MemberProfile = ({ memberData, events, allParticipatingEvents, recentActivities }) => {
  if (!memberData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  // Filter upcoming events (both regular and participating)
  const upcomingEvents = events.filter(event => {
    if (!event.eventDateTime) return false;
    const eventDate = new Date(event.eventDateTime);
    const today = new Date();
    // Clear time part for accurate date comparison
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }).sort((a, b) => new Date(a.eventDateTime) - new Date(b.eventDateTime));

  // Filter upcoming participating events (all events, not just user's)
  const upcomingParticipatingEvents = allParticipatingEvents.filter(event => {
    if (!event.eventDate) return false;
    const eventDate = new Date(event.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  // Combine all upcoming events
  const allUpcomingEvents = [...upcomingEvents, ...upcomingParticipatingEvents]
    .sort((a, b) => {
      const dateA = new Date(a.eventDateTime || a.eventDate);
      const dateB = new Date(b.eventDateTime || b.eventDate);
      return dateA - dateB;
    });

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-md"
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mr-4">{memberData.fullName?.[0]?.toUpperCase() ?? '?'}</div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome, {memberData.fullName}</h1>
              <p className="text-slate-600 mt-1">Your {memberData.designation} Dashboard</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700">Member ID: {memberData.memberId}</span>
            <span className="bg-emerald-100 px-3 py-1 rounded-full text-sm text-emerald-700">Status: {memberData.status?.charAt(0).toUpperCase() + memberData.status?.slice(1)}</span>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <FiUser className="text-slate-500 mr-2" />
            <h2 className="text-lg font-medium text-slate-900">Personal Information</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email</p>
                <p className="font-medium text-slate-900">{memberData.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phone</p>
                <p className="font-medium text-slate-900">{memberData.phone || 'Not provided'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Member Since</p>
                  <p className="font-medium text-slate-900">{formatDate(memberData.createdAt)}</p>
                </div>
                {memberData.approvedAt && (
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Approved On</p>
                    <p className="font-medium text-slate-900">{formatDate(memberData.approvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <FiBell className="text-slate-500 mr-2" />
            <h2 className="text-lg font-medium text-slate-900">Recent Activity</h2>
          </div>
          <button className="text-sky-600 hover:underline text-sm font-medium">View all</button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity, index) => (
                <ActivityItem
                  key={index}
                  icon={activity.icon}
                  title={activity.title}
                  subtitle={activity.subtitle}
                  timeAgo={formatTimeAgo(activity.date)}
                />
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No recent activities found</p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <FiCalendar className="text-slate-500 mr-2" />
            <h2 className="text-lg font-medium text-slate-900">Upcoming Events</h2>
          </div>
          <button className="text-sky-600 hover:underline text-sm font-medium">View all</button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {allUpcomingEvents.length > 0 ? (
              allUpcomingEvents.slice(0, 3).map((event, index) => (
                <EventRow
                  key={index}
                  event={event}
                />
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No upcoming events found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, title, subtitle, timeAgo }) => (
  <div className="flex items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
    <div className="p-2 rounded-full mr-3 bg-white shadow-sm">{icon}</div>
    <div>
      <p className="font-medium text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{subtitle}</p>
      <p className="text-xs text-slate-400 mt-1">{timeAgo}</p>
    </div>
  </div>
);

const EventRow = ({ event }) => {
  if (!event) return null;

  const formatEventDate = (dateString) => {
    if (!dateString) return { day: 'N/A', month: 'N/A' };
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Check if it's a regular event or participating event
  const isParticipatingEvent = event.hasOwnProperty('subEvents');

  const eventDate = isParticipatingEvent ? event.eventDate : event.eventDateTime;
  const { day, month } = formatEventDate(eventDate);

  return (
    <div className="flex items-start">
      <div className={`p-3 rounded-lg mr-4 flex-shrink-0 text-center ${
        isParticipatingEvent ? 'bg-amber-50' : 'bg-fuchsia-50'
      }`}>
        <div className={`font-bold text-lg ${
          isParticipatingEvent ? 'text-amber-600' : 'text-fuchsia-600'
        }`}>{day}</div>
        <div className={`text-xs ${
          isParticipatingEvent ? 'text-amber-500' : 'text-fuchsia-500'
        }`}>{month}</div>
      </div>
      <div>
        <p className="font-medium text-slate-900">{event.eventName || event.title}</p>
        <p className="text-sm text-slate-600">{event.description}</p>
        <p className="text-xs text-slate-400 mt-1">
          {formatEventTime(eventDate)}
          {isParticipatingEvent && event.location && ` • ${event.location}`}
          {isParticipatingEvent && <span className="ml-2 bg-amber-100 text-amber-800 p-1 rounded text-xs">Participating</span>}
        </p>
        <p className="font-medium text-slate-900 mt-1 text-xs">Created by: {event.memberId || event.createdBy.fullName} {event.memberId ? <span className='text-fuchsia-500'>(member id)</span> : <span className='text-amber-500'>(member name)</span>} </p>
      </div>
    </div>
  );
};

export default MemberDashboard;
