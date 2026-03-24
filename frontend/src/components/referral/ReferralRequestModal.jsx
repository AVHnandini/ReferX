import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Send } from 'lucide-react';
import { referralService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ReferralRequestModal({ isOpen, onClose, job, alumni }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    resume: '',
  });
  const [resumeFile, setResumeFile] = useState(null);

  // Add null checks for props
  if (!job || !alumni) {
    return null;
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setFormData(prev => ({
        ...prev,
        resume: file.name
      }));
    } else {
      addToast('Please upload a PDF resume', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!formData.message.trim()) {
      addToast('Please add a message', 'error');
      return;
    }

    setLoading(true);
    try {
      await referralService.request({
        alumniId: alumni._id,
        jobId: job._id,
        message: formData.message,
        resume: formData.resume,
        requestedVia: 'job'
      });

      addToast('Referral request sent successfully!', 'success');
      onClose();
      setFormData({ message: '', resume: '' });
      setResumeFile(null);
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to send referral request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Request Referral</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Job & Alumni Info */}
            <div className="mb-6">
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">For Position</p>
                <p className="text-white font-semibold">{job.title}</p>
                <p className="text-sm text-gray-400">{job.company}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Alumni</p>
                <p className="text-white font-semibold">{alumni.name}</p>
                <p className="text-sm text-gray-400">{alumni.jobRole} at {alumni.company}</p>
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Why are you interested in this opportunity? What makes you a good fit?"
                rows={4}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500</p>
            </div>

            {/* Resume Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resume (Optional)
              </label>
              <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-300">
                  {resumeFile ? resumeFile.name : 'Upload PDF resume'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}