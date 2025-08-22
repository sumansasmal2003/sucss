import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaUsers, FaUserCog, FaInfoCircle, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: <FaHome size={18} />, link: '/' },
    { id: 'login', label: 'Login', icon: <FaUser size={18} />, link: '/login' },
    { id: 'members', label: 'Members', icon: <FaUsers size={18} />, link: '/members' },
    { id: 'admin', label: 'Admin', icon: <FaUserCog size={18} />, link: '/admin' },
    { id: 'about', label: 'About Us', icon: <FaInfoCircle size={18} />, link: '/about' },
  ];

  const spring = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  };

  const isActive = (link) => {
    return (
      currentPath === link ||
      (currentPath === '/' && link === '/') ||
      (link !== '/' && currentPath.startsWith(link))
    );
  };

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className="hidden md:flex justify-center py-4 bg-white text-gray-800 shadow-sm border-b border-gray-200 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="max-w-6xl w-full flex justify-between items-center px-6">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent"
          >
            SUCSS
          </Link>

          <div className="flex">
            {navItems.map((item) => (
              <Link
                key={item.id}
                className={`flex items-center cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium`}
                to={item.link}
              >
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 w-full ${
                    isActive(item.link)
                      ? 'bg-sky-50 ring-1 ring-sky-200 text-sky-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:ring-1 hover:ring-gray-100'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navbar Toggle Button */}
      <motion.button
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white flex items-center justify-center text-sky-600 shadow-lg ring-1 ring-gray-200"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </motion.button>

      {/* Mobile Navbar Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.nav
              className="md:hidden fixed bottom-20 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 w-64"
              initial={{ opacity: 0, scale: 0.95, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 60 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="flex flex-col space-y-3 px-3">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center p-2 rounded-lg transition-all"
                  >
                    <motion.div
                      className={`flex items-center p-2 rounded-lg w-full ${
                        isActive(item.link)
                          ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      whileTap={{ scale: 0.98 }}
                      layout
                    >
                      <div className="mr-3">{item.icon}</div>
                      <span className="font-medium">{item.label}</span>
                      {isActive(item.link) && (
                        <motion.div
                          className="w-2 h-2 bg-sky-600 rounded-full ml-auto"
                          layoutId="mobileNavIndicator"
                          transition={spring}
                        />
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
