// src/pages/AllEvents.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiSearch, FiCalendar, FiClock, FiUser, FiFilter } from 'react-icons/fi';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.eventDateTime) - new Date(a.eventDateTime);
    } else if (sortOption === 'oldest') {
      return new Date(a.eventDateTime) - new Date(b.eventDateTime);
    } else if (sortOption === 'name') {
      return a.eventName.localeCompare(b.eventName);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-red-100 text-red-700 border border-red-300 px-6 py-4 rounded-xl max-w-md">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Community Events</h1>
          <p className="text-xl text-gray-600 font-medium">Discover & Connect</p>
          <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-indigo-500 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600">
            Explore upcoming events created by our community members
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-10 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events by name or description..."
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">Sort by:</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Event Name</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="py-16 text-center">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FiCalendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No events found</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                {searchTerm
                  ? `No events match your search for "${searchTerm}". Try different keywords.`
                  : "There are no upcoming events at the moment. Check back later!"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center">
                        <div className="bg-sky-100 text-sky-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-sky-200">
                          {event.memberName}
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          ID: {event.memberId}
                        </span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-gray-900">{event.eventName}</h2>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <FiCalendar className="h-6 w-6 text-sky-500" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center text-gray-700 mb-3">
                      <FiClock className="h-5 w-5 mr-2 text-sky-500" />
                      <span className="font-medium">
                        {format(new Date(event.eventDateTime), 'MMM dd, yyyy')} •{' '}
                        {format(new Date(event.eventDateTime), 'hh:mm a')}
                      </span>
                    </div>

                    <div className="mt-5 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700">{event.description}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-sky-500 to-indigo-500 rounded-xl w-8 h-8 flex items-center justify-center text-white text-xs font-bold">
                        {event.memberName ? event.memberName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-500">Created by</p>
                        <p className="font-medium text-gray-900">{event.memberName}</p>
                      </div>
                    </div>
                    <span className="text-gray-500">
                      {format(new Date(event.createdAt), 'MMM dd, yyyy')}
                    </span>
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

export default AllEvents;
