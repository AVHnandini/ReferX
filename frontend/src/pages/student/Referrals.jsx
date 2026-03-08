import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Clock, CheckCircle, XCircle, Award } from 'lucide-react';
import { referralService } from '../../services/api';

const STATUS = {
  pending: { icon: Clock, color: '#fbbf24', label: 'Pending' },
  accepted: { icon: CheckCircle, color: '#22d3ee', label: 'Accepted' },
  rejected: { icon: XCircle, color: '#f43f5e', label: 'Rejected' },
  referred: { icon: Award, color: '#a3e635', label: 'Referred!' },
};

export default function StudentReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralService.getStatus().then(r => setReferrals(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Referrals</h1>
        <p className="text-gray-400 text-sm mt-1">Track all your referral requests</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(STATUS).map(([key, s]) => (
          <div key={key} className="card text-center">
            <div className="font-display text-2xl font-bold" style={{ color: s.color }}>
              {referrals.filter(r => r.status === key).length}
            </div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {referrals.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <GitBranch size={48} className="mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold mb-2">No referrals yet</h3>
          <p className="text-sm">Browse jobs and request referrals to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.map((ref, i) => {
            const s = STATUS[ref.status] || STATUS.pending;
            return (
              <motion.div key={ref.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {ref.jobs?.company?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{ref.jobs?.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: s.color + '20', color: s.color }}>{s.label}</span>
                  </div>
                  <p className="text-sm text-gray-400">{ref.jobs?.company} · {ref.jobs?.location}</p>
                  {ref.alumni && <p className="text-xs text-gray-500 mt-1">Alumni: {ref.alumni.name} ({ref.alumni.job_role})</p>}
                  {ref.feedback && <p className="text-xs text-gray-400 mt-1 italic">"{ref.feedback}"</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <s.icon size={20} style={{ color: s.color }} />
                  <p className="text-xs text-gray-500 mt-1">{new Date(ref.created_at).toLocaleDateString()}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
