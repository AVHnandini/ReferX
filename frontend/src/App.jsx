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
import StudentProfile from './pages/student/Profile';
import StudentAlumni from './pages/student/AlumniDiscovery';
import StudentAlumniProfile from './pages/student/AlumniProfile';
import AlumniDashboard from './pages/alumni/Dashboard';
import AlumniJobs from './pages/alumni/Jobs';
import AlumniReferrals from './pages/alumni/Referrals';
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
  const { user, role: userRole, loading } = useAuth();
  const effectiveRole = user?.role || userRole;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (!user && !effectiveRole) return <Navigate to="/login" />;
  if (role && effectiveRole !== role) return <Navigate to={getRoleRedirect(effectiveRole)} />;
  return children;
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (user) return <Navigate to={getRoleRedirect(user.role)} />;
  const storedRole = localStorage.getItem('referx_role');
  const storedToken = localStorage.getItem('referx_token');
  if (storedToken && storedRole) return <Navigate to={getRoleRedirect(storedRole)} />;
  return <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/student/dashboard" element={<Navigate to="/student" replace />} />
      <Route path="/alumni/dashboard" element={<Navigate to="/alumni" replace />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={user ? <Navigate to={getRoleRedirect(user.role)} /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={getRoleRedirect(user.role)} /> : <Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      
      <Route path="/student" element={<ProtectedRoute role="student"><Layout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="jobs" element={<StudentJobs />} />
        <Route path="alumni" element={<StudentAlumni />} />
        <Route path="alumni/:id" element={<StudentAlumniProfile />} />
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
      
      <Route path="*" element={user ? <Navigate to={getRoleRedirect(user.role)} /> : <Navigate to="/login" />} />
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
