// src/pages/LandingPage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import flagImage from '../assets/indiaFlag.png';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 overflow-hidden relative">
      {/* Subtle Flag overlay */}
      <img
        src={flagImage}
        alt="Indian Flag"
        className="pointer-events-none fixed inset-0 m-auto w-full max-w-4xl opacity-10 mix-blend-overlay z-0"
      />

      {/* Light Glassmorphism background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-sky-200/40 to-indigo-200/20 blur-3xl" />
        <div className="absolute right-[-120px] top-28 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-300/40 to-sky-100/20 blur-2xl" />
      </div>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Glassmorphism card */}
              <div className="bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-sky-600 uppercase tracking-widest font-semibold">Preserving Heritage</p>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mt-2">
                      Sijgeria Umesh Chandra
                      <span className="block bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
                        Smriti Sangha
                      </span>
                    </h1>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  A cultural organization dedicated to preserving our rich heritage, fostering community bonds,
                  and celebrating our shared traditions through meaningful events and activities.
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <button
                    onClick={() => navigate('/membership')}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-indigo-300/50 hover:scale-[1.02] transition-all duration-300"
                  >
                    Join Our Community
                  </button>
                  <button
                    onClick={() => navigate('/all/events')}
                    className="px-8 py-3 rounded-full bg-transparent border border-sky-400 text-sky-700 font-medium hover:bg-sky-100 transition backdrop-blur-sm"
                  >
                    Upcoming Events
                  </button>
                </div>

                {/* Info strip */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-sky-100 to-indigo-100 border border-gray-200 flex items-center justify-between backdrop-blur-md">
                  <div />
                  <div className="text-right">
                    <p className="text-gray-700 text-sm font-medium">Location</p>
                    <p className="text-sm">Sijgeria, Debra, Paschim Medinipur, 721139</p>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="mt-6 flex gap-4 items-center">
                <div className="p-4 rounded-xl bg-sky-100 border border-gray-200 backdrop-blur-md shadow-sm">
                  <p className="text-2xl font-bold text-sky-700">200+</p>
                  <p className="text-sm text-gray-700">Members</p>
                </div>
                <div className="p-4 rounded-xl bg-sky-100 border border-gray-200 backdrop-blur-md shadow-sm">
                  <p className="text-2xl font-bold text-sky-700">15+</p>
                  <p className="text-sm text-gray-700">Years</p>
                </div>
                <div className="p-4 rounded-xl bg-sky-100 border border-gray-200 backdrop-blur-md shadow-sm hidden sm:block">
                  <p className="text-sm text-gray-700">Community</p>
                  <p className="text-sm font-semibold">Events • Education • Culture</p>
                </div>
              </div>
            </motion.div>

            {/* Right visual area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative flex items-center justify-center"
            >
              <div className="w-full max-w-lg rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white/70 p-6 backdrop-blur-md">
                <div className="h-64 rounded-xl bg-gradient-to-b from-sky-50 to-transparent flex items-center justify-center relative overflow-hidden">
                  <div className="relative z-10 text-center px-4">
                    <h3 className="text-2xl font-bold">Cultural Celebration</h3>
                    <p className="text-gray-700 mt-2 max-w-[22rem] mx-auto">
                      Traditional festivals, cultural programs, and community gatherings
                    </p>
                    <div className="mt-6 flex gap-3 justify-center">
                      <button
                        onClick={() => navigate('/gallery')}
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-sky-300/50 transition"
                      >
                        View Gallery
                      </button>
                      <button
                        onClick={() => navigate('/all/events')}
                        className="px-6 py-2 rounded-full bg-transparent border border-sky-400 text-sky-700 font-medium hover:bg-sky-100 transition backdrop-blur-sm"
                      >
                        Event Calendar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-sky-100 border border-gray-200 text-center backdrop-blur-sm">
                    <p className="text-sm text-gray-700">Programs</p>
                    <p className="font-bold text-sky-700">12+</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-100 border border-gray-200 text-center backdrop-blur-sm">
                    <p className="text-sm text-gray-700">Volunteers</p>
                    <p className="font-bold text-sky-700">50+</p>
                  </div>
                  <div className="p-3 rounded-lg bg-sky-100 border border-gray-200 text-center backdrop-blur-sm">
                    <p className="text-sm text-gray-700">Years</p>
                    <p className="font-bold text-sky-700">15+</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ACTIVITIES SECTION */}
        <section className="py-16 px-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-900"
            >
              Our Community Activities
            </motion.h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-3 text-lg">
              We celebrate our heritage through various cultural, educational, and community initiatives
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Cultural Preservation',
                desc: 'Traditional celebrations, festivals, and cultural performances that honor our heritage',
                icon: '🎭',
                color: 'from-sky-200 to-indigo-100'
              },
              {
                title: 'Educational Programs',
                desc: 'Scholarships, workshops, and learning opportunities for community members of all ages',
                icon: '📚',
                color: 'from-indigo-200 to-sky-100'
              },
              {
                title: 'Community Service',
                desc: 'Initiatives to support local development, social welfare, and community building',
                icon: '🤝',
                color: 'from-sky-100 to-indigo-200'
              },
            ].map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="rounded-2xl p-6 bg-white border border-gray-200 shadow-lg hover:shadow-sky-200/50 transition-all backdrop-blur-md"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 backdrop-blur-sm`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-sky-100 to-indigo-100 rounded-2xl p-10 border border-gray-200 shadow-2xl backdrop-blur-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Join Our Community</h3>
            <p className="mb-6 text-gray-700 max-w-2xl mx-auto">
              Become part of our growing family dedicated to preserving our heritage and building a stronger community
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/membership')}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold hover:shadow-indigo-300/50 hover:scale-[1.02] transition-all"
              >
                Register as Member
              </button>

              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-3 rounded-full bg-transparent border border-sky-400 text-sky-700 font-semibold hover:bg-sky-100 transition backdrop-blur-sm"
              >
                Contact Committee
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
