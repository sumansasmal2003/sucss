import React from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <motion.footer
      className="bg-gradient-to-br from-gray-50 to-white text-gray-800 py-12 px-4 relative border-t border-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div className="space-y-4" whileHover={{ y: -4 }}>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
            SUCSS
          </h3>
          <p className="text-gray-600">Sijgeria Umesh Chandra Smriti Sangha</p>
          <p className="text-sm text-gray-500">Preserving heritage, building community, and celebrating tradition</p>
        </motion.div>

        <motion.div className="space-y-3" whileHover={{ y: -4 }}>
          <h4 className="text-lg font-semibold text-gray-700">Contact Us</h4>
          <div className="flex items-center space-x-3">
            <FiMail className="text-sky-600" />
            <a href="mailto:sijgeria@gmail.com" className="hover:text-sky-600 transition-colors text-gray-700">
              sijgeria@gmail.com
            </a>
          </div>
          <div className="flex items-start space-x-3">
            <FiMapPin className="text-sky-600 mt-1" />
            <p className="text-gray-700">
              Sijgeria, Debra,
              <br />
              Paschim Medinipur,
              <br />
              West Bengal - 721139
            </p>
          </div>
        </motion.div>

        <motion.div className="space-y-3" whileHover={{ y: -4 }}>
          <h4 className="text-lg font-semibold text-gray-700">Quick Links</h4>
          <ul className="space-y-2">
            {['Membership', 'Events', 'Gallery', 'Contact'].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-700 hover:text-sky-600 transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Sijgeria Umesh Chandra Smriti Sangha. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;
