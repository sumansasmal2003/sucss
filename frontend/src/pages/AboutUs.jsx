// File: AboutUs.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiCalendar,
  FiHeart,
  FiBook,
  FiStar,
  FiAward,
  FiTarget,
  FiGlobe
} from 'react-icons/fi';
import flagImage from '../assets/sucss.png';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-sky-200/40 to-indigo-100/20 blur-3xl" />
        <div className="absolute right-[-120px] top-28 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-200/30 to-sky-100/20 blur-2xl" />
      </div>

      {/* Fixed Indian Flag in the background (subtle) */}
      <div className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none">
        <img
          src={flagImage}
          alt="Indian Flag"
          className="w-full max-w-3xl opacity-6 object-contain"
        />
      </div>

      {/* Main Content */}
      <main className="flex-grow relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-sm"
            >
              <motion.h1
                className="text-4xl md:text-5xl font-bold mb-6 text-gray-800"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  repeat: Infinity,
                  duration: 8,
                  ease: 'linear'
                }}
                style={{
                  backgroundImage: 'linear-gradient(90deg, rgba(56,189,248,1), rgba(79,70,229,1))',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                About Our Sangha
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Preserving heritage, fostering community, and building the future since 1985
              </motion.p>
            </motion.div>
          </section>

          {/* History Section */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-white/80 border border-gray-100 rounded-2xl p-8 shadow-sm"
              >
                <div className="bg-gradient-to-r from-sky-400 to-indigo-400 w-24 h-1 rounded-full mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Our History</h2>
                <p className="text-gray-600 mb-4 text-lg">
                  Founded in 1985, Sijgeria Umesh Chandra Smriti Sangha was established to honor the legacy of Umesh Chandra, a respected community leader and social reformer from Sijgeria.
                </p>
                <p className="text-gray-600 mb-4 text-lg">
                  What began as a small gathering of like-minded individuals has grown into a vibrant community organization with over 500 active members. For nearly four decades, we've been dedicated to preserving our cultural heritage while fostering community development.
                </p>
                <p className="text-gray-600 text-lg">
                  Our journey has been marked by numerous milestones, from establishing our community center in 1995 to launching our youth education program in 2005.
                </p>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="aspect-video bg-white/70 rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex items-center justify-center">
                  <FiAward className="text-sky-500 text-6xl" />
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white/80 p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-sky-500 to-indigo-500 p-3 rounded-lg mr-4">
                      <FiCalendar className="text-white text-2xl" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Since 1985</p>
                      <p className="text-gray-500">Serving the community</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                className="bg-white/80 rounded-2xl p-8 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-gradient-to-r from-sky-500 to-indigo-500 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                  <FiHeart className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                <p className="text-gray-600 mb-4">
                  To preserve and promote our cultural heritage while fostering community development through educational initiatives, social welfare programs, and cultural preservation.
                </p>
                <ul className="space-y-2">
                  {[
                    "Promote cultural awareness among youth",
                    "Support education through scholarships",
                    "Preserve traditional arts and crafts",
                    "Provide community healthcare initiatives",
                    "Foster economic development"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FiStar className="text-sky-400 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                className="bg-white/80 rounded-2xl p-8 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="bg-gradient-to-r from-sky-500 to-indigo-500 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-6">
                  <FiTarget className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
                <p className="text-gray-600 mb-4">
                  To create a self-sustaining community that honors its past while building a prosperous future, where every member feels connected, supported, and empowered.
                </p>
                <ul className="space-y-2">
                  {[
                    "A thriving cultural center by 2030",
                    "Education for all community children",
                    "Preservation of 100+ cultural artifacts",
                    "Intergenerational knowledge transfer",
                    "Sustainable community development"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FiStar className="text-sky-400 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <motion.div
                className="bg-gradient-to-r from-sky-400 to-indigo-400 w-24 h-1 rounded-full mx-auto mb-6"
                initial={{ opacity: 0, width: 0 }}
                whileInView={{ opacity: 1, width: 96 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                These principles guide everything we do at Sijgeria Umesh Chandra Smriti Sangha
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Heritage Preservation",
                  desc: "Honoring our traditions, language, and cultural practices",
                  icon: <FiBook className="text-3xl" />,
                  color: "from-sky-500 to-indigo-500"
                },
                {
                  title: "Community First",
                  desc: "Putting the needs of our community members above all else",
                  icon: <FiUsers className="text-3xl" />,
                  color: "from-indigo-500 to-sky-500"
                },
                {
                  title: "Integrity",
                  desc: "Acting with honesty, transparency, and accountability",
                  icon: <FiHeart className="text-3xl" />,
                  color: "from-sky-400 to-indigo-500"
                }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  className={`rounded-2xl p-8 shadow-sm border border-gray-100 bg-gradient-to-br ${value.color}/10`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="text-sky-600 text-4xl mb-6 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">{value.title}</h3>
                  <p className="text-gray-600 text-center">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Community Impact */}
          <section className="mb-20">
            <div className="text-center mb-16">
              <motion.div
                className="bg-gradient-to-r from-sky-400 to-indigo-400 w-24 h-1 rounded-full mx-auto mb-6"
                initial={{ opacity: 0, width: 0 }}
                whileInView={{ opacity: 1, width: 96 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Community Impact</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Our contributions to the community over the years
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "500+", label: "Members", icon: <FiUsers className="text-2xl" /> },
                { value: "15+", label: "Years", icon: <FiCalendar className="text-2xl" /> },
                { value: "200+", label: "Events", icon: <FiStar className="text-2xl" /> },
                { value: "50+", label: "Programs", icon: <FiGlobe className="text-2xl" /> }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/80 rounded-2xl p-6 text-center border border-gray-100 shadow-sm"
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.45 }}
                >
                  <div className="text-sky-500 mb-3 flex justify-center">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;
