import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Briefcase, GitBranch, TrendingUp, Star, ArrowRight, Zap, Award, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobService, referralService } from '../../services/api';

const STATUS_COLORS = { pending: '#fbbf24', accepted: '#22d3ee', rejected: '#f43f5e', referred: '#a3e635' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([jobService.getRecommended(), referralService.getStatus()])
      .then(([j, r]) => { setJobs(j.data.slice(0, 4)); setReferrals(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const profileScore = user?.profile_score || 0;
  const scoreData = [{ name: 'score', value: profileScore, fill: '#6366f1' }];

  const refStatusData = ['pending', 'accepted', 'rejected', 'referred'].map(s => ({
    name: s, value: referrals.filter(r => r.status === s).length, fill: STATUS_COLORS[s]
  })).filter(d => d.value > 0);

  const card = (delay = 0) => ({
    initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay }
  });

  if (loading) return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-32 animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...card(0)}>
        <h1 className="font-display text-2xl font-bold">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Here's what's happening with your job search</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Referrals', value: referrals.filter(r => r.status === 'pending').length, icon: GitBranch, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Jobs Matched', value: jobs.length, icon: Briefcase, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
          { label: 'Referred', value: referrals.filter(r => r.status === 'referred').length, icon: Award, color: 'text-accent-lime', bg: 'bg-accent-lime/10' },
          { label: 'Profile Score', value: `${profileScore}%`, icon: TrendingUp, color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
        ].map((s, i) => (
          <motion.div key={s.label} {...card(i * 0.08)} className="card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="font-display text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Strength */}
        <motion.div {...card(0.2)} className="card">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Star size={16} className="text-accent-amber" /> Profile Strength</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Completion</span>
            <span className="text-sm font-bold text-brand-400">{profileScore}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 mb-4">
            <motion.div initial={{ width: 0 }} animate={{ width: `${profileScore}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-2 bg-gradient-to-r from-brand-500 to-accent-cyan rounded-full" />
          </div>
          {profileScore < 100 && (
            <div className="space-y-2 mt-4">
              {!user?.skills?.length && <div className="text-xs text-gray-400 flex items-center gap-2"><Zap size={12} className="text-brand-400" /> Add your skills (+20pts)</div>}
              {!user?.resume && <div className="text-xs text-gray-400 flex items-center gap-2"><Zap size={12} className="text-brand-400" /> Upload resume (+25pts)</div>}
              {!user?.linkedin && <div className="text-xs text-gray-400 flex items-center gap-2"><Zap size={12} className="text-brand-400" /> Add LinkedIn (+15pts)</div>}
            </div>
          )}
          <Link to="/student/profile" className="btn-primary text-sm py-2 w-full flex items-center justify-center gap-2 mt-4">
            Complete Profile <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Referral Chart */}
        <motion.div {...card(0.25)} className="card">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2"><GitBranch size={16} className="text-brand-400" /> Referral Status</h3>
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <GitBranch size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No referrals yet</p>
              <Link to="/student/jobs" className="text-xs text-brand-400 mt-2 hover:underline">Browse jobs →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {['pending', 'accepted', 'referred', 'rejected'].map(s => {
                const count = referrals.filter(r => r.status === s).length;
                if (!count) return null;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
                    <span className="text-sm text-gray-300 capitalize flex-1">{s}</span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div {...card(0.3)} className="card">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Clock size={16} className="text-accent-cyan" /> Recent Referrals</h3>
          <div className="space-y-3">
            {referrals.slice(0, 4).map(ref => (
              <div key={ref.id} className="flex items-center gap-3 p-2 rounded-xl glass">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-xs font-bold text-white">
                  {ref.jobs?.company?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{ref.jobs?.title || 'Job'}</p>
                  <p className="text-xs text-gray-500 truncate">{ref.jobs?.company}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                  style={{ background: STATUS_COLORS[ref.status] + '20', color: STATUS_COLORS[ref.status] }}>
                  {ref.status}
                </span>
              </div>
            ))}
            {referrals.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No referrals yet</p>}
          </div>
        </motion.div>
      </div>

      {/* Recommended Jobs */}
      <motion.div {...card(0.35)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold flex items-center gap-2"><Briefcase size={16} className="text-brand-400" /> Recommended Jobs</h3>
          <Link to="/student/jobs" className="text-xs text-brand-400 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
              className="card hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{job.title}</h4>
                  <p className="text-sm text-gray-400">{job.company}</p>
                </div>
                {job.match_percentage > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-accent-lime/10 text-accent-lime font-bold">
                    {job.match_percentage}% match
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{job.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {(job.required_skills || []).slice(0, 3).map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full glass text-gray-300">{s}</span>
                ))}
              </div>
              <p className="text-xs text-gray-500">{job.location} · {job.salary}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
