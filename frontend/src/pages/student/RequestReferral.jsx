import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { referralService, jobService, userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Send, Upload, X, FileText } from 'lucide-react';

export default function RequestReferral() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [alumni, setAlumni] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    jobId: '',
    message: '',
    resume: null,
  });

  const [resumeFileName, setResumeFileName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [alumniRes, jobsRes] = await Promise.all([
        userService.getAlumni(),
        jobService.getAllJobs(),
      ]);
      setAlumni(alumniRes.data?.alumni || alumniRes.alumni || []);
      setJobs(jobsRes.jobs || jobsRes.data || []);
    } catch (error) {
      console.error('Data loading error:', error);
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        addToast('Please upload a PDF file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast('File size must be less than 5MB', 'error');
        return;
      }
      setFormData(prev => ({ ...prev, resume: file }));
      setResumeFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      addToast('Please write a message', 'error');
      return;
    }

    if (formData.message.length < 10) {
      addToast('Message must be at least 10 characters', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const targetAlumni = (alumni || []).filter((a) => !!a);

      if (targetAlumni.length === 0) {
        console.warn('RequestReferral: alumni list is empty', alumni);
        addToast('No alumni available, please ask admin to verify alumni', 'error');
        return;
      }

      const requests = targetAlumni.map((alum) => {
        const alumniId = alum.id || alum._id || alum._id?.toString();
        if (!alumniId) {
          console.warn('RequestReferral: alumni object missing id', alum);
          return Promise.resolve();
        }
        const payload = {
          alumniId,
          jobId: formData.jobId || null,
          message: formData.message,
          requestedVia: formData.jobId ? 'job' : 'direct',
          resume: resumeFileName || '',
        };
        return referralService.request(payload);
      });

      await Promise.all(requests);
      addToast(`Referral requests sent to ${targetAlumni.length} alumni successfully!`, 'success');
      setTimeout(() => navigate('/student/referrals'), 1500);
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to send some requests', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === formData.jobId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Request a Referral</h1>
        <p className="text-gray-400">
          Send a referral request to all alumni in the application ({alumni.length} available)
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card space-y-6"
      >
        {/* Job Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Job (Optional - leave blank for direct referral)
          </label>

          {selectedJob ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{selectedJob.title}</p>
                <p className="text-sm text-gray-400">{selectedJob.company}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, jobId: '' }))}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <select
              value={formData.jobId}
              onChange={(e) => setFormData(prev => ({ ...prev, jobId: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select or leave blank for direct referral --</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title} - {j.company}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Your Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Tell them why you're requesting a referral and what help you need..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
          />
          <p className="text-xs text-gray-400 mt-2">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Resume (Optional - PDF up to 5MB)
          </label>

          {resumeFileName ? (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-400" />
                <div>
                  <p className="text-white font-medium">{resumeFileName}</p>
                  <p className="text-xs text-gray-400">
                    {(formData.resume?.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, resume: null }));
                  setResumeFileName('');
                }}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
              <Upload size={20} className="text-gray-400" />
              <div>
                <p className="text-white font-medium">Click to upload resume</p>
                <p className="text-xs text-gray-400">PDF up to 5MB</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-300">
            💡 Tip: This request will be sent to all approved alumni in the application. Be specific about what you need help with. Include your skills, experience level, and what career stage you're at.
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/student/referrals')}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            <Send size={18} />
            {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}