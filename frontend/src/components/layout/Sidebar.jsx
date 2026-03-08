import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui';
import {
  LayoutDashboard, Briefcase, Users, MessageSquare, User,
  Bell, LogOut, Sun, Moon, ChevronLeft, ChevronRight,
  Trophy, BookOpen, Settings, ShieldCheck, BarChart3
} from 'lucide-react';

const navByRole = {
  student: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/student' },
    { icon: Briefcase, label: 'Jobs', to: '/jobs' },
    { icon: BookOpen, label: 'My Referrals', to: '/student/referrals' },
    { icon: Users, label: 'Alumni', to: '/student/alumni' },
    { icon: MessageSquare, label: 'Messages', to: '/chat' },
    { icon: Trophy, label: 'Leaderboard', to: '/student/leaderboard' },
  ],
  alumni: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/alumni' },
    { icon: Briefcase, label: 'Post Jobs', to: '/alumni/jobs' },
    { icon: BookOpen, label: 'Referral Requests', to: '/alumni/referrals' },
    { icon: MessageSquare, label: 'Messages', to: '/chat' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
    { icon: Users, label: 'Users', to: '/admin/users' },
    { icon: ShieldCheck, label: 'Verify Alumni', to: '/admin/verify' },
    { icon: Briefcase, label: 'Jobs', to: '/admin/jobs' },
    { icon: BookOpen, label: 'Referrals', to: '/admin/referrals' },
    { icon: BarChart3, label: 'Insights', to: '/admin/insights' },
  ],
};

export default function Sidebar({ notifications = 0 }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = navByRole[user?.role] || [];

  return (
    <aside className={`flex flex-col glass border-r border-white/5 transition-all duration-300 h-screen sticky top-0 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-[#00FF87] text-sm">R</span>
        </div>
        {!collapsed && <span className="font-display font-bold text-lg">ReferX</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink key={to} to={to} end={to.split('/').length <= 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium
              ${isActive ? 'text-[#00FF87] bg-[#00FF87]/10 border border-[#00FF87]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}
              ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 space-y-1 border-t border-white/5">
        <button onClick={() => navigate('/profile')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}>
          <User size={18} />
          {!collapsed && 'Profile'}
        </button>

        <button onClick={toggle}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && (isDark ? 'Light Mode' : 'Dark Mode')}
        </button>

        <button onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm ${collapsed ? 'justify-center' : ''}`}>
          <LogOut size={18} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} src={user?.avatar_url} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/30 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0d0d16] border border-white/10 flex items-center justify-center hover:border-[#00FF87]/30 transition-all">
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
