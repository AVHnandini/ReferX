import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/api';
import { Avatar, Badge } from '../ui';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const notifRef = useRef(null);

  useEffect(() => {
    notificationService.getNotifications().then(d => setNotifs(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    await notificationService.markAllRead().catch(() => {});
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className="glass border-b border-white/5 sticky top-0 z-20 px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {title && <h1 className="font-display font-semibold text-lg">{title}</h1>}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs, alumni..."
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00FF87]/30 w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(s => !s)}
            className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-[#00FF87]/20 flex items-center justify-center transition-all">
            <Bell size={16} className="text-white/60" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00FF87] rounded-full text-black text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 glass rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="font-semibold text-sm">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-[#00FF87] hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="p-6 text-center text-white/30 text-sm">No notifications</div>
                ) : (
                  notifs.slice(0, 15).map(n => (
                    <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all ${!n.is_read ? 'bg-[#00FF87]/3' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-white/10' : 'bg-[#00FF87]'}`} />
                        <div>
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-white/40 mt-0.5">{n.message}</p>
                          <p className="text-xs text-white/20 mt-1">{getTimeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Avatar name={user?.name} src={user?.avatar_url} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-white/30 capitalize">{user?.role}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
