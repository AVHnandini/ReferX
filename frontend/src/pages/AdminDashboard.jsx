import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { adminAPI, usersAPI, referralsAPI, jobsAPI } from '../services/api';
import { Avatar, Badge, StatusBadge, Skeleton, EmptyState } from '../components/ui';
import { Users, Briefcase, BookOpen, ShieldCheck, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#00FF87', '#00b4d8', '#a855f7', '#f59e0b', '#f43f5e'];

function AdminHome() {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getStats().then(d => setStats(d.stats)),
      adminAPI.getInsights().then(d => setInsights(d)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div>;

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-[#00FF87]' },
    { label: 'Total Alumni', value: stats?.totalAlumni || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: ShieldCheck, color: 'text-amber-400' },
    { label: 'Total Referrals', value: stats?.totalReferrals || 0, icon: BookOpen, color: 'text-purple-400' },
    { label: 'Active Jobs', value: stats?.activeJobs || 0, icon: Briefcase, color: 'text-rose-400' },
  ];

  const statusData = Object.entries(stats?.referralsByStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl mb-1">Admin Dashboard</h1>
        <p className="text-white/40">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon size={20} className={`${color} mb-3`} />
            <div className="font-display font-bold text-3xl mb-0.5">{value}</div>
            <div className="text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top companies */}
        {insights?.topCompanies?.length > 0 && (
          <div className="card">
            <h3 className="font-display font-semibold mb-4">Most Requested Companies</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={insights.topCompanies.slice(0,6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#00FF87" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Referral status breakdown */}
        {statusData.length > 0 && (
          <div className="card">
            <h3 className="font-display font-semibold mb-4">Referral Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" nameKey="name" paddingAngle={4}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-white/60">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="capitalize">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular skills */}
        {insights?.topSkills?.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="font-display font-semibold mb-4">Most In-Demand Skills</h3>
            <div className="space-y-2">
              {insights.topSkills.slice(0, 8).map((skill, i) => (
                <div key={skill.name} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-32 truncate">{skill.name}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{
                      width: `${(skill.count / insights.topSkills[0].count) * 100}%`,
                      background: COLORS[i % COLORS.length]
                    }} />
                  </div>
                  <span className="text-xs text-white/30 w-6 text-right">{skill.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminVerify() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');

  useEffect(() => {
    adminAPI.getPendingAlumni().then(d => setAlumni(d.alumni || [])).finally(() => setLoading(false));
  }, []);

  const handle = async (id, status) => {
    setProcessing(id);
    try {
      await adminAPI.approveAlumni(id, { status });
      setAlumni(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.error);
    } finally {
      setProcessing('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display font-bold text-2xl flex items-center gap-2">
        <ShieldCheck className="text-[#00FF87]" size={24} /> Alumni Verification ({alumni.length})
      </h2>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>
      ) : alumni.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="All caught up!" description="No pending alumni verifications" />
      ) : (
        <div className="space-y-4">
          {alumni.map(a => (
            <div key={a.id} className="card">
              <div className="flex items-start gap-4">
                <Avatar name={a.name} />
                <div className="flex-1">
                  <h4 className="font-semibold">{a.name}</h4>
                  <p className="text-sm text-white/40">{a.job_role} @ {a.company}</p>
                  <p className="text-xs text-white/30 mt-1">{a.email} · {a.years_experience} years exp</p>
                  {a.linkedin_url && (
                    <a href={a.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 block">
                      {a.linkedin_url}
                    </a>
                  )}
                  <p className="text-xs text-white/20 mt-1">Applied: {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handle(a.id, 'approved')} disabled={processing === a.id}
                    className="flex items-center gap-1.5 bg-[#00FF87]/15 text-[#00FF87] hover:bg-[#00FF87]/25 text-sm px-4 py-2 rounded-xl border border-[#00FF87]/20 transition-all">
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => handle(a.id, 'rejected')} disabled={processing === a.id}
                    className="flex items-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm px-4 py-2 rounded-xl border border-red-500/20 transition-all">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    usersAPI.getAllUsers().then(d => setUsers(d.users || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  const deleteUser = async (id) => {
    if (!confirm('Remove this user?')) return;
    await usersAPI.deleteUser(id).catch(() => {});
    setUsers(u => u.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-2xl flex items-center gap-2"><Users size={22} /> All Users</h2>
        <div className="flex gap-2">
          {['all', 'student', 'alumni', 'admin'].map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${filter === r ? 'bg-[#00FF87] text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-xs">
                <th className="text-left py-3 pr-4">User</th>
                <th className="text-left py-3 pr-4">Role</th>
                <th className="text-left py-3 pr-4">Company</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-left py-3 pr-4">Score</th>
                <th className="text-left py-3">Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-white/2 transition-all">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-white/30">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4"><Badge variant={u.role === 'admin' ? 'purple' : u.role === 'alumni' ? 'blue' : 'accent'}>{u.role}</Badge></td>
                  <td className="py-3 pr-4 text-white/50 text-xs">{u.company || '—'}</td>
                  <td className="py-3 pr-4"><StatusBadge status={u.verification_status} /></td>
                  <td className="py-3 pr-4 text-white/50">{u.profile_score || 0}%</td>
                  <td className="py-3 text-xs text-white/30">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    {u.role !== 'admin' && (
                      <button onClick={() => deleteUser(u.id)} className="text-xs text-red-400/50 hover:text-red-400 transition-colors">Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralsAPI.getAllReferrals().then(d => setReferrals(d.referrals || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display font-bold text-2xl">All Referrals ({referrals.length})</h2>
      {loading ? <Skeleton className="h-64" /> : (
        <div className="card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-xs">
                <th className="text-left py-3 pr-4">Student</th>
                <th className="text-left py-3 pr-4">Job</th>
                <th className="text-left py-3 pr-4">Alumni</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-left py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {referrals.map(r => (
                <tr key={r.id} className="hover:bg-white/2 transition-all">
                  <td className="py-3 pr-4 font-medium">{r.student?.name}</td>
                  <td className="py-3 pr-4 text-white/60">{r.job?.title} @ {r.job?.company}</td>
                  <td className="py-3 pr-4 text-white/60">{r.alumni?.name}</td>
                  <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                  <td className="py-3 text-xs text-white/30">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="verify" element={<AdminVerify />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="referrals" element={<AdminReferrals />} />
        <Route path="insights" element={<AdminHome />} />
      </Routes>
    </DashboardLayout>
  );
}
