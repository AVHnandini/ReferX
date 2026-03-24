import React from "react";
import { Bell, Search, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <div className="h-16 glass border-b border-white/10 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, companies..."
            className="w-full pl-12 pr-4 py-2 rounded-xl glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell size={18} className="text-gray-300" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            3
          </span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
            {user?.name?.[0]?.toUpperCase() || "S"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
