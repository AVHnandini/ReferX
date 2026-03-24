import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { referralService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import ReferralStatusBadge from '../../components/referral/ReferralStatusBadge';
import InterviewScheduling from '../../components/referral/InterviewScheduling';
import { Clock, CheckCircle, XCircle, MessageSquare, FileText, ChevronDown } from 'lucide-react';

export default function AlumniRequests() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);
  const [respondingStatus, setRespondingStatus] = useState(null);
  const [customFeedback, setCustomFeedback] = useState('');
  const [scheduleId, setScheduleId] = useState(null);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const response = await referralService.getAlumniReferrals();
      setReferrals(response.data);
    } catch (error) {
      addToast('Failed to load referrals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, status, feedback = '') => {
    try {
      await referralService.respond(id, { status, feedback });
      addToast(`Referral ${status} successfully`, 'success');
      setRespondingId(null);
      setRespondingStatus(null);
      setCustomFeedback('');
      loadReferrals();
    } catch (error) {
      addToast('Failed to respond to referral', 'error');
    }
  };

  const filteredReferrals = referrals.filter(ref => ref.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statusCounts = {
    pending: referrals.filter(r => r.status === 'pending').length,
    accepted: referrals.filter(r => r.status === 'accepted').length,
    rejected: referrals.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Referral Requests</h1>
        <p className="text-gray-400">Review and respond to student referral requests</p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-8">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
          </button>
        ))}
      </div>

      {/* Referrals List */}
      {filteredReferrals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Requests</h3>
          <p className="text-gray-400">
            {filter === 'pending'
              ? 'You have no pending referral requests at the moment.'
              : `You have no ${filter} referrals.`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredReferrals.map((referral, index) => (
              <motion.div
                key={referral._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {referral.studentId?.name}
                    </h3>
                    {referral.jobId && (
                      <p className="text-gray-400 text-sm">
                        Requesting help for: {referral.jobId.title} at {referral.jobId.company}
                      </p>
                    )}
                  </div>
                  <ReferralStatusBadge status={referral.status} />
                </div>

                {/* Student Message */}
                {referral.message && (
                  <div className="mb-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <p className="text-sm text-gray-400 mb-2">Student Message</p>
                    <p className="text-gray-200">{referral.message}</p>
                  </div>
                )}

                {/* Resume */}
                {referral.resume && (
                  <div className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <a
                      href={referral.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                    >
                      <FileText size={16} />
                      View Resume
                    </a>
                  </div>
                )}

                {/* Expand Button */}
                {filter === 'pending' && (
                  <button
                    onClick={() => setExpandedId(expandedId === referral._id ? null : referral._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors mb-4"
                  >
                    <span>
                      {expandedId === referral._id ? 'Hide' : 'Show'} Response Options
                    </span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        expandedId === referral._id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}

                {/* Response Section */}
                <AnimatePresence>
                  {expandedId === referral._id && filter === 'pending' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 border-t border-gray-600 pt-4"
                    >
                      {/* Accept Option */}
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                          <CheckCircle size={18} />
                          Accept Request
                        </h4>
                        <p className="text-gray-300 text-sm mb-4">
                          After accepting, you can schedule an interview with the student
                        </p>
                        <button
                          onClick={() => {
                            setRespondingId(referral._id);
                            setRespondingStatus('accepted');
                          }}
                          className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                        >
                          Accept
                        </button>
                      </div>

                      {/* Reject Option */}
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                          <XCircle size={18} />
                          Decline Request
                        </h4>
                        <p className="text-gray-300 text-sm mb-3">
                          Optionally provide feedback to help the student improve
                        </p>
                        <textarea
                          placeholder="Optional: Provide constructive feedback (or AI will generate)"
                          value={customFeedback}
                          onChange={(e) => setCustomFeedback(e.target.value)}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm mb-3"
                          rows={3}
                        />
                        <button
                          onClick={() => {
                            setRespondingId(referral._id);
                            setRespondingStatus('rejected');
                          }}
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                        >
                          Decline with Feedback
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Interview Scheduling (for accepted) */}
                {referral.status === 'accepted' && (
                  <div className="mt-4">
                    <button
                      onClick={() => setScheduleId(referral._id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Schedule Interview
                    </button>
                    {scheduleId === referral._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-600 pt-4 mt-4"
                      >
                        <InterviewScheduling
                          referral={referral}
                          onScheduled={() => {
                            setScheduleId(null);
                            loadReferrals();
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Request Interaction */}
                {respondingId === referral._id && respondingStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gray-700/30 border border-gray-600 rounded-lg"
                  >
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleRespond(
                            referral._id,
                            respondingStatus,
                            respondingStatus === 'rejected' ? customFeedback : ''
                          )
                        }
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                      >
                        Confirm {respondingStatus.charAt(0).toUpperCase() + respondingStatus.slice(1)}
                      </button>
                      <button
                        onClick={() => {
                          setRespondingId(null);
                          setRespondingStatus(null);
                          setCustomFeedback('');
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Meta Info */}
                {filter !== 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-600 flex items-center gap-2 text-gray-400 text-sm">
                    <Clock size={14} />
                    {referral.status === 'accepted'
                      ? `Accepted on ${new Date(referral.updatedAt).toLocaleDateString()}`
                      : `${referral.status.charAt(0).toUpperCase() + referral.status.slice(1)} on ${new Date(referral.updatedAt).toLocaleDateString()}`
                    }
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}