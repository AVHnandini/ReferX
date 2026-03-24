import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Clock, CheckCircle, XCircle, Award, Briefcase, X } from 'lucide-react';
import { referralService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'yellow', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', textColor: 'text-yellow-400' },
  accepted: { icon: CheckCircle, color: 'blue', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', textColor: 'text-blue-400' },
  rejected: { icon: XCircle, color: 'red', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', textColor: 'text-red-400' },
  referred: { icon: Award, color: 'green', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', textColor: 'text-green-400' },
};

export default function StudentReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const toast = useToast();

  useEffect(() => {
    referralService.getStudentReferrals()
      .then(r => setReferrals(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cancelReferral = async (id) => {
    if (!confirm('Are you sure you want to cancel this referral request?')) return;
    try {
      await referralService.cancel(id);
      setReferrals(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
      toast.success('Referral request cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel referral');
    }
  };

  const filteredReferrals = filter === 'all'
    ? referrals
    : referrals.filter(ref => ref.status === filter);

  const statusCounts = {
    all: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    accepted: referrals.filter(r => r.status === 'accepted').length,
    rejected: referrals.filter(r => r.status === 'rejected').length,
    referred: referrals.filter(r => r.status === 'referred').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">My Referrals</h1>
          <p className="text-gray-400">
            Track the status of all your referral requests
          </p>
        </motion.div>

        {/* Status Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <button
            onClick={() => setFilter('all')}
            className={`glass rounded-2xl p-4 text-center transition-all ${
              filter === 'all' ? 'bg-white/20 border-white/30' : 'hover:bg-white/10'
            }`}
          >
            <div className="text-2xl font-bold text-white">{statusCounts.all}</div>
            <div className="text-sm text-gray-400">Total</div>
          </button>

          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`glass rounded-2xl p-4 text-center transition-all ${
                  filter === status ? `${config.bgColor} border-white/30` : 'hover:bg-white/10'
                }`}
              >
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {statusCounts[status]}
                </div>
                <div className="text-sm text-gray-400 capitalize flex items-center justify-center gap-1">
                  <Icon size={14} />
                  {status}
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Referrals List */}
        {filteredReferrals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <GitBranch size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              {filter === 'all' ? 'No referrals yet' : `No ${filter} referrals`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? 'Browse jobs and request referrals to get started.'
                : `You don't have any ${filter} referrals at the moment.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => window.location.href = '/student/jobs'}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
              >
                Browse Jobs
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredReferrals.map((ref, index) => {
              const config = STATUS_CONFIG[ref.status] || STATUS_CONFIG.pending;
              const Icon = config.icon;

              return (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {ref.jobs?.company?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {ref.jobs?.title || 'Job Position'}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {ref.jobs?.company || 'Company'} • {ref.jobs?.location || 'Location'}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.borderColor} border`}>
                          <Icon size={14} className={config.textColor} />
                          <span className={`text-sm font-medium capitalize ${config.textColor}`}>
                            {ref.status}
                          </span>
                        </div>
                      </div>

                      {/* Alumni Info */}
                      {ref.alumni && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {ref.alumni.name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-400">
                            Requested from {ref.alumni.name} ({ref.alumni.job_role})
                          </span>
                        </div>
                      )}

                      {/* Feedback */}
                      {ref.feedback && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-sm text-gray-300 italic">"{ref.feedback}"</p>
                        </div>
                      )}

                      {/* Actions */}
                      {ref.status === 'pending' && (
                        <div className="mt-3">
                          <button
                            onClick={() => cancelReferral(ref.id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                          >
                            <X size={14} />
                            Cancel Request
                          </button>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 mt-3">
                        <Clock size={14} className="text-gray-500" />
                        <span className="text-xs text-gray-500">
                          Requested on {new Date(ref.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
