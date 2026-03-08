import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, GitBranch, Clock, CheckCircle, XCircle, Shield, Trash2 } from 'lucide-react';
import { adminService, userService } from '../../services/api';

const STATUS_COLORS = { pending: '#fbbf24', accepted: '#22d3ee', rejected: '#f43f5e', referred: '#a3e635' };

export default function AdminDashboard({ tab: initialTab }) {
  const [tab, setTab] = useState(initialTab || 'overview');
  const [stats, setStats] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getStats(), adminService.getAlumni(), userService.getAllUsers()])
      .then(([s, a, u]) => { setStats(s.data); setAlumni(a.data); setUsers(u.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id, status) => {
    await adminService.verifyAlumni(id, status);
    setAlumni(p => p.map(a => a.id === id ? { ...a, verification_status: status } : a));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await userService.deleteUser(id);
    setUsers(p => p.filter(u => u.id !== id));
  };

  const pieData = stats ? Object.entries(stats.referral_breakdown || {}).map(([k, v]) => ({ name: k, value: v, fill: STATUS_COLORS[k] || '#6366f1' })) : [];
  const barData = [
    { name: 'Students', count: stats?.total_students || 0 },
    { name: 'Alumni', count: stats?.total_alumni || 0 },
    { name: 'Jobs', count: stats?.active_jobs || 0 },
    { name: 'Referrals', count: stats?.total_referrals || 0 },
  ];

  const card = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Shield size={22} className="text-brand-400" /> Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Platform overview and management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 glass rounded-xl w-fit">
        {['overview', 'alumni', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-28 animate-pulse" />)}
        </div>
      ) : tab === 'overview' ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Students', value: stats?.total_students, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/10' },
              { label: 'Alumni', value: stats?.total_alumni, icon: Users, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
              { label: 'Pending Alumni', value: stats?.pending_alumni, icon: Clock, color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
              { label: 'Active Jobs', value: stats?.active_jobs, icon: Briefcase, color: 'text-accent-lime', bg: 'bg-accent-lime/10' },
              { label: 'Total Referrals', value: stats?.total_referrals, icon: GitBranch, color: 'text-accent-rose', bg: 'bg-accent-rose/10' },
            ].map((s, i) => (
              <motion.div key={s.label} {...card(i * 0.08)} className="card">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon size={18} className={s.color} />
                </div>
                <div className="font-display text-3xl font-bold">{s.value ?? 0}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div {...card(0.3)} className="card">
              <h3 className="font-display font-bold mb-4">Platform Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div {...card(0.35)} className="card">
              <h3 className="font-display font-bold mb-4">Referral Breakdown</h3>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No referral data yet</div>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="60%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                        <span className="text-xs text-gray-400 capitalize">{d.name}</span>
                        <span className="text-xs font-bold text-white ml-auto pl-4">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      ) : tab === 'alumni' ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-400">All Alumni ({alumni.length})</h3>
          {alumni.map((a, i) => (
            <motion.div key={a.id} {...card(i * 0.04)} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                {a.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{a.name}</p>
                <p className="text-xs text-gray-400">{a.email}</p>
                <p className="text-xs text-gray-500">{a.company} · {a.job_role}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full capitalize"
                style={{ background: (a.verification_status === 'approved' ? '#a3e635' : a.verification_status === 'rejected' ? '#f43f5e' : '#fbbf24') + '20',
                  color: a.verification_status === 'approved' ? '#a3e635' : a.verification_status === 'rejected' ? '#f43f5e' : '#fbbf24' }}>
                {a.verification_status}
              </span>
              {a.verification_status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(a.id, 'rejected')}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                    <XCircle size={16} />
                  </button>
                  <button onClick={() => handleVerify(a.id, 'approved')}
                    className="p-1.5 rounded-lg bg-accent-lime/10 text-accent-lime hover:bg-accent-lime/20 transition-all">
                    <CheckCircle size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-400">All Users ({users.length})</h3>
          {users.map((u, i) => (
            <motion.div key={u.id} {...card(i * 0.03)} className="card flex items-center gap-4">
              <div className="w-9 h-9 rounded-full glass flex items-center justify-center text-sm font-bold">
                {u.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white">{u.name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                u.role === 'admin' ? 'bg-brand-500/10 text-brand-400' : 
                u.role === 'alumni' ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-accent-lime/10 text-accent-lime'
              }`}>{u.role}</span>
              {u.role !== 'admin' && (
                <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg glass text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
