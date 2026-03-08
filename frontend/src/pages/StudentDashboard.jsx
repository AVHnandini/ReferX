import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, referralsAPI, usersAPI, resumeAPI } from '../services/api';
import { Avatar, Badge, ProgressBar, StatusBadge, Skeleton, EmptyState } from '../components/ui';
import { Briefcase, Users, BookOpen, TrendingUp, Star, Zap, ArrowRight, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// ---- Sub pages ----
function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobsAPI.getRecommended().then(d => setJobs(d.jobs?.slice(0, 6) || [])),
      referralsAPI.getStudentReferrals().then(d => setReferrals(d.referrals || [])),
      resumeAPI.analyze().then(d => setResumeData(d)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statusCounts = referrals.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { icon: Briefcase, label: 'Jobs Applied', value: referrals.length, color: 'text-[#00FF87]', bg: 'bg-[#00FF87]/10' },
    { icon: TrendingUp, label: 'Referrals Pending', value: statusCounts.pending || 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Star, label: 'Referrals Accepted', value: statusCounts.accepted || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Zap, label: 'Profile Score', value: `${user?.profile_score || 0}%`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const chartData = [
    { name: 'Jan', referrals: 0 },
    { name: 'Feb', referrals: 1 },
    { name: 'Mar', referrals: referrals.length },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/40">Here's your career dashboard</p>
        </div>
        <button onClick={() => navigate('/jobs')} className="btn-primary flex items-center gap-2 text-sm">
          Browse Jobs <ArrowRight size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <div className="font-display font-bold text-2xl mb-0.5">{value}</div>
            <div className="text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile strength */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Profile Strength</h3>
            <span className="text-[#00FF87] font-bold">{user?.profile_score || 0}%</span>
          </div>
          <ProgressBar value={user?.profile_score || 0} className="mb-4" />
          
          {resumeData?.suggestions?.slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-white/40 mb-2">
              <span className="text-amber-400 mt-0.5">→</span> {s}
            </div>
          ))}
          
          <button onClick={() => navigate('/profile')}
            className="mt-3 w-full btn-ghost text-xs py-2 rounded-xl">
            Complete Profile
          </button>
        </div>

        {/* Referral tracker */}
        <div className="card lg:col-span-2">
          <h3 className="font-display font-semibold mb-4">Referral Activity</h3>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF87" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00FF87" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0d0d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="referrals" stroke="#00FF87" fill="url(#refGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent referrals */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold">My Referral Requests</h3>
          <button onClick={() => navigate('/student/referrals')} className="text-xs text-[#00FF87] hover:underline">View all</button>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
        ) : referrals.length === 0 ? (
          <EmptyState icon={BookOpen} title="No referrals yet" description="Browse jobs and request your first referral"
            action={<button onClick={() => navigate('/jobs')} className="btn-primary text-sm">Browse Jobs</button>} />
        ) : (
          <div className="space-y-3">
            {referrals.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-all">
                <Avatar name={r.alumni?.name} src={r.alumni?.avatar_url} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.job?.title}</p>
                  <p className="text-xs text-white/40">{r.job?.company} · via {r.alumni?.name}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold">Recommended Jobs</h3>
          <button onClick={() => navigate('/jobs')} className="text-xs text-[#00FF87] hover:underline">See all</button>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {jobs.slice(0, 4).map(job => (
              <div key={job.id} className="glass glass-hover rounded-xl p-4 cursor-pointer" onClick={() => navigate('/jobs')}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-white/40">{job.company}</p>
                  </div>
                  {job.match_percentage && (
                    <Badge variant="accent">{job.match_percentage}% match</Badge>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  {(job.required_skills || []).slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    referralsAPI.getStudentReferrals().then(d => setReferrals(d.referrals || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? referrals : referrals.filter(r => r.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-2xl">My Referrals</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'accepted', 'rejected', 'referred'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${filter === s ? 'bg-[#00FF87] text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No referrals" description="Request referrals from alumni mentors" />
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-start gap-4">
                <Avatar name={r.alumni?.name} src={r.alumni?.avatar_url} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold">{r.job?.title}</p>
                      <p className="text-sm text-white/40">{r.job?.company} · {r.job?.location}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-white/40">Alumni: <span className="text-white/60">{r.alumni?.name}</span> @ {r.alumni?.company}</p>
                  {r.message && <p className="text-xs text-white/50 mt-2 italic">"{r.message}"</p>}
                  {r.alumni_feedback && (
                    <div className="mt-2 bg-[#00FF87]/5 rounded-lg p-2 text-xs text-[#00FF87]">
                      Alumni feedback: {r.alumni_feedback}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    usersAPI.getAlumni().then(d => setAlumni(d.alumni || [])).finally(() => setLoading(false));
  }, []);

  const filtered = alumni.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.company?.toLowerCase().includes(search.toLowerCase()) ||
    a.job_role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-2xl">Alumni Network</h2>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-field w-64 text-sm py-2" placeholder="Search alumni..." />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="card glass-hover cursor-pointer" onClick={() => navigate('/chat')}>
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={a.name} src={a.avatar_url} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{a.name}</p>
                  <p className="text-xs text-white/40">{a.job_role}</p>
                  <p className="text-xs text-[#00FF87]">{a.company}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(a.skills || []).slice(0, 4).map(s => (
                  <span key={s} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-md">{s}</span>
                ))}
              </div>
              <button className="w-full btn-ghost text-xs py-2 rounded-xl">Connect & Chat</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getLeaderboard().then(d => setLeaders(d.leaderboard || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-display font-bold text-2xl flex items-center gap-2">
        <Trophy className="text-[#00FF87]" size={24} /> Leaderboard
      </h2>
      <div className="card">
        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}</div>
        ) : (
          <div className="space-y-2">
            {leaders.map((u, i) => (
              <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/3 transition-all">
                <span className={`w-8 text-center font-bold text-lg ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-white/50' : i === 2 ? 'text-amber-700' : 'text-white/20'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                </span>
                <Avatar name={u.name} src={u.avatar_url} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-white/30 capitalize">{u.role} {u.company && `@ ${u.company}`}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#00FF87]">{u.points || 0}</p>
                  <p className="text-xs text-white/30">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<StudentHome />} />
        <Route path="referrals" element={<StudentReferrals />} />
        <Route path="alumni" element={<StudentAlumni />} />
        <Route path="leaderboard" element={<StudentLeaderboard />} />
      </Routes>
    </DashboardLayout>
  );
}
