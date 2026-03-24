import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Briefcase, GitBranch, User, MessageSquare, LogOut, Menu, X, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";

const navItems = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/student/jobs", label: "Jobs", icon: Briefcase },
  { to: "/student/referrals", label: "Referrals", icon: GitBranch },
  { to: "/student/chat", label: "Messages", icon: MessageSquare },
  { to: "/student/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center"
      >
        <Menu size={20} className="text-white" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed lg:static inset-y-0 left-0 w-64 glass border-r border-white/10 z-50"
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-display font-bold text-xl text-white">ReferX</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg glass flex items-center justify-center"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl glass mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
              {user?.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <item.icon size={18} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 mt-auto"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
