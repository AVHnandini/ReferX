import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Link as LinkIcon, Send } from 'lucide-react';
import { referralService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function InterviewScheduling({ referral, onScheduled }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    interviewLink: referral?.interviewLink || '',
    interviewDate: referral?.interviewDate ? new Date(referral.interviewDate).toISOString().slice(0, 16) : '',
  });

  const handleSubmit = async () => {
    if (!formData.interviewLink.trim()) {
      addToast('Please enter interview link', 'error');
      return;
    }
    if (!formData.interviewDate) {
      addToast('Please select interview date and time', 'error');
      return;
    }

    setLoading(true);
    try {
      await referralService.schedule(referral._id, {
        interviewLink: formData.interviewLink,
        interviewDate: new Date(formData.interviewDate).toISOString(),
      });

      addToast('Interview scheduled successfully!', 'success');
      onScheduled?.();
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to schedule interview', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg"
    >
      <h3 className="font-semibold text-blue-300 mb-4 flex items-center gap-2">
        <Calendar size={18} />
        Schedule Interview
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Interview Link (Zoom/Google Meet/etc)
          </label>
          <div className="relative">
            <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="url"
              placeholder="https://zoom.us/..."
              value={formData.interviewLink}
              onChange={(e) => setFormData(prev => ({ ...prev, interviewLink: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Interview Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.interviewDate}
            onChange={(e) => setFormData(prev => ({ ...prev, interviewDate: e.target.value }))}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
        >
          <Send size={16} />
          {loading ? 'Scheduling...' : 'Schedule Interview'}
        </button>
      </div>

      {referral?.interviewDate && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-300">
            ✓ Interview scheduled for {new Date(referral.interviewDate).toLocaleString()}
          </p>
        </div>
      )}
    </motion.div>
  );
}