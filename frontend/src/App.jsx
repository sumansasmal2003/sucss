import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Members from './pages/Members';
import AboutUs from './pages/AboutUs'
import MemberDashboard from './pages/MemberDashboard';
import UploadEvents from './pages/UploadEvents';
import AllEvents from './pages/AllEvents';
import ParticipatingEvent from './pages/ParticipatingEvent';
import UserDashboard from './pages/UserDashboard';
import UserRecords from './pages/UserRecords';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/members" element={<Members />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/all/events" element={<AllEvents />} />

            {/* Protected routes */}
            <Route path="/user/dashboard" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            } />

            <Route path="/member/dashboard" element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberDashboard />
              </ProtectedRoute>
            }>
              <Route path="upload-events" element={<UploadEvents />} />
              <Route path="upload-participating-events" element={<ParticipatingEvent />} />
              <Route path="users/records" element={<UserRecords />} />
            </Route>

            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
