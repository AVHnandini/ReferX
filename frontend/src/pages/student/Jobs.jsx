import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Briefcase, CheckCircle } from 'lucide-react';
import { jobService, referralService, userService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import JobCard from '../../components/student/JobCard';

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [requestModal, setRequestModal] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alumni, setAlumni] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const toast = useToast();

  useEffect(() => {
    Promise.all([jobService.getRecommended(), userService.getAllUsers()])
      .then(([j, u]) => {
        setJobs(j.data);
        setAlumni(u.data.filter(u => u.role === 'alumni' && u.verification_status === 'approved'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkills = selectedSkills.length === 0 ||
                         selectedSkills.some(skill =>
                           job.required_skills?.some(jobSkill =>
                             jobSkill.toLowerCase().includes(skill.toLowerCase())
                           )
                         );

    return matchesSearch && matchesSkills;
  });

  const allSkills = [...new Set(jobs.flatMap(job => job.required_skills || []))];

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleViewDetails = (job) => {
    // Navigate to job details page or open modal
    console.log('View job details:', job);
  };

  const handleRequestReferral = (job) => {
    setRequestModal(job);
    setSelectedAlumni(null);
    setMessage('');
  };

  const submitReferralRequest = async () => {
    if (!requestModal || !selectedAlumni) return;
    setSubmitting(true);

    try {
      await referralService.request({
        alumni_id: selectedAlumni.id,
        job_id: requestModal.id,
        message: message || 'I would appreciate a referral for this position.'
      });

      toast.success('Referral request sent successfully!');
      setRequestModal(null);
      setSelectedAlumni(null);
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Job Board</h1>
          <p className="text-gray-400">
            Discover opportunities and request referrals from verified alumni
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {/* Skills Filter */}
            <div className="lg:w-80">
              <div className="relative">
                <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  multiple
                  value={selectedSkills}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedSkills(values);
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-transparent"
                >
                  {allSkills.map(skill => (
                    <option key={skill} value={skill} className="bg-gray-800 text-white">
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedSkills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                  <button
                    onClick={() => toggleSkill(skill)}
                    className="text-blue-400 hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Briefcase size={64} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={handleViewDetails}
                onRequestReferral={handleRequestReferral}
                delay={0.2 + index * 0.1}
              />
            ))}
          </motion.div>
        )}

        {/* Referral Request Modal */}
        {requestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setRequestModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Request Referral</h3>
              <div className="mb-4">
                <p className="text-gray-300 mb-2">Position: {requestModal.title}</p>
                <p className="text-gray-400 text-sm">Company: {requestModal.company}</p>
              </div>

              <div className="mb-4">
                <h4 className="text-white font-medium mb-3">Select Alumni to Request From:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {alumni.filter(a => a.verification_status === 'approved').map((alum) => (
                    <div
                      key={alum.id}
                      onClick={() => setSelectedAlumni(alum)}
                      className={`p-3 rounded-xl cursor-pointer transition-colors ${
                        selectedAlumni?.id === alum.id
                          ? 'bg-blue-600/20 border border-blue-500/50'
                          : 'glass hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm">
                          {alum.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{alum.name}</p>
                          <p className="text-gray-400 text-sm">{alum.job_role} at {alum.company}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {alumni.filter(a => a.verification_status === 'approved').length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">No verified alumni available for this company.</p>
                )}
              </div>

              {selectedAlumni && (
                <div className="mb-4">
                  <textarea
                    placeholder="Add a personal message (optional)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setRequestModal(null)}
                  className="flex-1 py-3 px-4 rounded-xl glass text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReferralRequest}
                  disabled={submitting || !selectedAlumni}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Send Request'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
