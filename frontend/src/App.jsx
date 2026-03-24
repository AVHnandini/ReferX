import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyOtp from './pages/auth/VerifyOtp';
import StudentDashboard from './pages/student/Dashboard';
import StudentJobs from './pages/student/Jobs';
import StudentReferrals from './pages/student/Referrals';
import StudentRequestReferral from './pages/student/RequestReferral';
import StudentProfile from './pages/student/Profile';
import StudentAlumni from './pages/student/AlumniDiscovery';
import StudentAlumniProfile from './pages/student/AlumniProfile';
import AlumniDashboard from './pages/alumni/Dashboard';
import AlumniJobs from './pages/alumni/Jobs';
import AlumniReferrals from './pages/alumni/Referrals';
import AlumniRequests from './pages/alumni/Requests';
import ProfileSettings from './pages/alumni/ProfileSettings';
import AdminDashboard from './pages/admin/Dashboard';
import Chat from './pages/Chat';
import Layout from './components/layout/Layout';

const getRoleRedirect = (role) => {
  if (role === 'student') return '/student/dashboard';
  if (role === 'alumni') return '/alumni/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/login';
};

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');
  const storageRole = localStorage.getItem('role');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  const effectiveRole = user?.role || storageRole;
  const isAuthenticated = Boolean(user || (token && storageRole));

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && effectiveRole !== role) return <Navigate to={getRoleRedirect(effectiveRole)} />;

  return children;
};

const getLoginRedirect = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role) return null;
  return getRoleRedirect(role);
};

const AppRoutes = () => {
  const { user } = useAuth();
  const loginRedirect = getLoginRedirect();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={loginRedirect ? <Navigate to={loginRedirect} replace /> : <Login />} />
      <Route path="/signup" element={loginRedirect ? <Navigate to={loginRedirect} replace /> : <Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route path="/student/*" element={<ProtectedRoute role="student"><Layout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="jobs" element={<StudentJobs />} />
        <Route path="alumni" element={<StudentAlumni />} />
        <Route path="alumni/:id" element={<StudentAlumniProfile />} />
        <Route path="request-referral" element={<StudentRequestReferral />} />
        <Route path="referrals" element={<StudentReferrals />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route path="/alumni/*" element={<ProtectedRoute role="alumni"><Layout /></ProtectedRoute>}>
        <Route index element={<AlumniDashboard />} />
        <Route path="dashboard" element={<AlumniDashboard />} />
        <Route path="jobs" element={<AlumniJobs />} />
        <Route path="referrals" element={<AlumniReferrals />} />
        <Route path="requests" element={<AlumniRequests />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route path="/admin/*" element={<ProtectedRoute role="admin"><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminDashboard tab="users" />} />
      </Route>

      <Route path="*" element={loginRedirect ? <Navigate to={loginRedirect} replace /> : <Landing />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="noise-bg min-h-screen">
          <AppRoutes />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
