import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, GitBranch, Briefcase, Clock, CheckCircle, Award, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { referralService, jobService } from '../../services/api';

const STATUS_COLORS = { pending: '#fbbf24', accepted: '#22d3ee', rejected: '#f43f5e', referred: '#a3e635' };

export default function AlumniDashboard() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([referralService.getStatus(), jobService.getAllJobs()])
      .then(([r, j]) => {
        setReferrals(r.data);
        setJobs(j.data.filter(job => job.posted_by === user?.id));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const pending = referrals.filter(r => r.status === 'pending');

  if (user?.verification_status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="card max-w-md w-full p-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-amber-400" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Verification Pending</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Your account is pending admin verification. You'll be able to start referring students once approved.</p>
          <div className="mt-6 p-4 rounded-xl glass text-left">
            <p className="text-xs text-gray-400 mb-1">What happens next?</p>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Admin reviews your profile and documents</li>
              <li>• Approval typically takes 1–2 business days</li>
              <li>• You'll be notified when approved</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const card = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay } });

  return (
    <div className="space-y-6">
      <motion.div {...card(0)}>
        <h1 className="font-display text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Help students land their dream jobs</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Requests', value: pending.length, icon: Clock, color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
          { label: 'Students Referred', value: referrals.filter(r => r.status === 'referred').length, icon: Award, color: 'text-accent-lime', bg: 'bg-accent-lime/10' },
          { label: 'Jobs Posted', value: jobs.length, icon: Briefcase, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Total Requests', value: referrals.length, icon: GitBranch, color: 'text-accent-cyan', bg: 'bg-accent-cyan/10' },
        ].map((s, i) => (
          <motion.div key={s.label} {...card(i * 0.08)} className="card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Pending Requests */}
      <motion.div {...card(0.2)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold flex items-center gap-2"><Clock size={16} className="text-accent-amber" /> Pending Requests</h3>
          <Link to="/alumni/referrals" className="text-xs text-brand-400 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        {pending.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No pending requests. All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((ref, i) => (
              <motion.div key={ref.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {ref.student?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">{ref.student?.name}</p>
                  <p className="text-xs text-gray-400">{ref.jobId?.title} · {ref.jobId?.company}</p>
                  {ref.message && <p className="text-xs text-gray-500 mt-1 truncate">"{ref.message}"</p>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(ref.student?.skills || []).slice(0, 2).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full glass text-gray-400">{s}</span>
                  ))}
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-400/10 text-amber-400">Pending</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* My Jobs */}
      <motion.div {...card(0.3)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold flex items-center gap-2"><Briefcase size={16} className="text-brand-400" /> My Job Posts</h3>
          <Link to="/alumni/jobs" className="text-xs text-brand-400 hover:underline flex items-center gap-1">Manage <ArrowRight size={12} /></Link>
        </div>
        {jobs.length === 0 ? (
          <div className="card text-center py-8 text-gray-500">
            <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No jobs posted yet.</p>
            <Link to="/alumni/jobs" className="text-xs text-brand-400 mt-2 hover:underline block">Post a job →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.slice(0, 4).map(job => (
              <div key={job.id} className="card">
                <h4 className="font-semibold text-white">{job.title}</h4>
                <p className="text-sm text-gray-400">{job.company} · {job.location}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(job.required_skills || []).slice(0, 3).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full glass text-gray-400">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
