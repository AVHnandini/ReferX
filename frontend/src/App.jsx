import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyOtp from './pages/auth/VerifyOtp';
import StudentDashboard from './pages/student/Dashboard';
import StudentJobs from './pages/student/Jobs';
import StudentReferrals from './pages/student/Referrals';
import StudentProfile from './pages/student/Profile';
import AlumniDashboard from './pages/alumni/Dashboard';
import AlumniJobs from './pages/alumni/Jobs';
import AlumniReferrals from './pages/alumni/Referrals';
import AdminDashboard from './pages/admin/Dashboard';
import Chat from './pages/Chat';
import Layout from './components/layout/Layout';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={`/${user.role}`} /> : <Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      
      <Route path="/student" element={<ProtectedRoute role="student"><Layout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="jobs" element={<StudentJobs />} />
        <Route path="referrals" element={<StudentReferrals />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="chat" element={<Chat />} />
      </Route>
      
      <Route path="/alumni" element={<ProtectedRoute role="alumni"><Layout /></ProtectedRoute>}>
        <Route index element={<AlumniDashboard />} />
        <Route path="jobs" element={<AlumniJobs />} />
        <Route path="referrals" element={<AlumniReferrals />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="admin"><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminDashboard tab="users" />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <div className="noise-bg min-h-screen">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}
