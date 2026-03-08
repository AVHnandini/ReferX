import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Briefcase, GitBranch, User, MessageSquare, 
  LogOut, Menu, X, Bell, Shield, ChevronRight, Zap 
} from 'lucide-react';

const navItems = {
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/student/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/student/referrals', label: 'Referrals', icon: GitBranch },
    { to: '/student/chat', label: 'Messages', icon: MessageSquare },
    { to: '/student/profile', label: 'Profile', icon: User },
  ],
  alumni: [
    { to: '/alumni', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/alumni/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/alumni/referrals', label: 'Referrals', icon: GitBranch },
    { to: '/alumni/chat', label: 'Messages', icon: MessageSquare },
    { to: '/alumni/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/users', label: 'Users', icon: User },
  ]
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items = navItems[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-6' : 'p-6'}`}>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <span className="font-display font-bold text-xl text-white">ReferX</span>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl glass mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize flex items-center gap-1">
            {user?.role === 'admin' && <Shield size={10} />}
            {user?.role}
            {user?.verification_status === 'pending' && <span className="text-amber-400 ml-1">· pending</span>}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map(({ to, label, icon: Icon, exact }) => (
          <NavLink key={to} to={to} end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            {({ isActive }) => (<>
              <Icon size={18} className={isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'} />
              {label}
              {isActive && <ChevronRight size={14} className="ml-auto text-brand-400" />}
            </>)}
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full mt-4">
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-black/20">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 bg-gray-900 border-r border-white/10">
              <div className="absolute top-4 right-4">
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg glass text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-black/10 flex items-center justify-between px-6">
          <button className="lg:hidden p-2 rounded-lg glass text-gray-400" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 rounded-xl glass text-gray-400 hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
