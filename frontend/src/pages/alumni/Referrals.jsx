import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, User, CheckCircle, XCircle, Award, ChevronDown } from 'lucide-react';
import { referralService } from '../../services/api';

const STATUS_COLORS = { pending: '#fbbf24', accepted: '#22d3ee', rejected: '#f43f5e', referred: '#a3e635' };

export default function AlumniReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    referralService.getStatus().then(r => setReferrals(r.data)).finally(() => setLoading(false));
  }, []);

  const respond = async (id, status) => {
    try {
      await referralService.respond(id, { status, feedback: feedback[id] || '' });
      setReferrals(p => p.map(r => r.id === id ? { ...r, status } : r));
      setExpanded(null);
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}</div>;

  const pending = referrals.filter(r => r.status === 'pending');
  const others = referrals.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Referral Requests</h1>
        <p className="text-gray-400 text-sm mt-1">Review and respond to student referral requests</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {['pending', 'accepted', 'referred', 'rejected'].map(s => (
          <div key={s} className="card text-center">
            <div className="font-display text-2xl font-bold" style={{ color: STATUS_COLORS[s] }}>
              {referrals.filter(r => r.status === s).length}
            </div>
            <div className="text-xs text-gray-400 mt-1 capitalize">{s}</div>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-amber-400 mb-3">Pending ({pending.length})</h3>
          <div className="space-y-3">
            {pending.map((ref, i) => (
              <motion.div key={ref.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="card cursor-pointer" onClick={() => setExpanded(expanded === ref.id ? null : ref.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold">
                      {ref.student?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{ref.student?.name}</p>
                      <p className="text-xs text-gray-400">{ref.jobs?.title} at {ref.jobs?.company}</p>
                    </div>
                    <div className="flex gap-1">
                      {(ref.student?.skills || []).slice(0, 2).map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full glass text-gray-400">{s}</span>
                      ))}
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded === ref.id ? 'rotate-180' : ''}`} />
                  </div>

                  {expanded === ref.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      {ref.message && (
                        <div className="p-3 rounded-xl glass">
                          <p className="text-xs text-gray-400 mb-1">Student's message:</p>
                          <p className="text-sm text-gray-200">"{ref.message}"</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {(ref.student?.skills || []).map(s => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">{s}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">Profile Score: <span className="text-white font-semibold">{ref.student?.profile_score}%</span></p>
                      <textarea value={feedback[ref.id] || ''} onChange={e => setFeedback(p => ({ ...p, [ref.id]: e.target.value }))}
                        placeholder="Optional feedback for student..." className="input text-sm min-h-16 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => respond(ref.id, 'rejected')} className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1">
                          <XCircle size={14} /> Decline
                        </button>
                        <button onClick={() => respond(ref.id, 'accepted')} className="flex-1 py-2 rounded-xl text-sm font-medium bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 transition-all flex items-center justify-center gap-1">
                          <CheckCircle size={14} /> Accept
                        </button>
                        <button onClick={() => respond(ref.id, 'referred')} className="flex-1 py-2 rounded-xl text-sm font-medium bg-accent-lime/10 text-accent-lime hover:bg-accent-lime/20 transition-all flex items-center justify-center gap-1">
                          <Award size={14} /> Refer
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-400 mb-3">Previous ({others.length})</h3>
          <div className="space-y-2">
            {others.map(ref => (
              <div key={ref.id} className="card flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-xs font-bold">
                  {ref.student?.name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{ref.student?.name}</p>
                  <p className="text-xs text-gray-500">{ref.jobs?.title}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full capitalize font-medium"
                  style={{ background: STATUS_COLORS[ref.status] + '20', color: STATUS_COLORS[ref.status] }}>
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {referrals.length === 0 && (
        <div className="card text-center py-16 text-gray-500">
          <GitBranch size={48} className="mx-auto mb-4 opacity-30" />
          <p>No referral requests yet. Students will reach out once they see your profile.</p>
        </div>
      )}
    </div>
  );
}
