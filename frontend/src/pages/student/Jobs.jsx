import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [referralMessage, setReferralMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [detailJob, setDetailJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState(() => JSON.parse(localStorage.getItem('savedJobs') || '[]'));
  const [alumni, setAlumni] = useState([]);
  const toast = useToast();

  useEffect(() => {
    Promise.all([jobService.getRecommended(), userService.getAllUsers()])
      .then(([j, u]) => {
        setJobs(j.data);
        setAlumni(u.data.filter(u => u.role === 'alumni' && u.verificationStatus === 'approved'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

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
    setDetailJob(job);
  };

  const handleCloseDetails = () => {
    setDetailJob(null);
  };

  const handleSaveJob = (job) => {
    setSavedJobs(prev => {
      const alreadySaved = prev.some(item => (item._id || item.id) === (job._id || job.id));
      if (alreadySaved) {
        toast.error('Job already saved');
        return prev;
      }
      toast.success('Job added to saved list');
      return [...prev, job];
    });
  };

  const handleOpenReferralModal = (job) => {
    console.log('Button clicked', job);

    if (!job || (!job._id && !job.id)) {
      toast.error('Invalid job, cannot request referral.');
      return;
    }

    const alumniFromJob = job.postedBy || job.posted_by;
    if (!alumniFromJob) {
      toast.error('Job has no associated alumni.');
      return;
    }

    console.log('selectedJob', job);
    setSelectedJob(job);
    setReferralMessage(`Hi, I am interested in ${job.title} at ${job.company}. I would appreciate your referral.`);
    setShowReferralModal(true);
  };

  const handleCloseReferralModal = () => {
    setShowReferralModal(false);
    setSelectedJob(null);
    setReferralMessage('');
  };

  const handleSubmitReferral = async () => {
    if (!selectedJob) {
      toast.error('No selected job to request referral for.');
      return;
    }

    const jobId = selectedJob._id || selectedJob.id;
    let alumniId = selectedJob.postedBy || selectedJob.posted_by;
    if (alumniId && typeof alumniId === 'object') {
      alumniId = alumniId._id || alumniId.id;
    }

    if (!jobId || !alumniId) {
      toast.error('Invalid job or alumni data for referral request.');
      return;
    }

    if (!referralMessage.trim()) {
      toast.error('Please type a referral message.');
      return;
    }

    try {
      setSubmitting(true);
      console.log('selectedJob details', selectedJob);  
      console.log('posting referral', { jobId, alumniId, message: referralMessage });

      const token = localStorage.getItem('token');
      await axios.post('/api/referrals/request', {
        jobId,
        alumniId,
        message: referralMessage,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Referral requested');
      console.log('Referral saved');
      setShowReferralModal(false);
      setSelectedJob(null);
      setReferralMessage('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit referral request');
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
                onRequestReferral={handleOpenReferralModal}
                onSaveJob={handleSaveJob}
                delay={0.2 + index * 0.1}
              />
            ))}
          </motion.div>
        )}

        {/* Job Detail Modal */}
        {detailJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{detailJob.title}</h3>
                  <p className="text-gray-400">{detailJob.company}</p>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  Close
                </button>
              </div>
              <p className="text-gray-300 mb-3">{detailJob.description || 'No description available.'}</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <span className="font-medium text-white">Location: </span>
                  {detailJob.location || 'N/A'}
                </div>
                <div>
                  <span className="font-medium text-white">Type: </span>
                  {detailJob.type || 'Full-time'}
                </div>
                <div>
                  <span className="font-medium text-white">Salary: </span>
                  {detailJob.salary || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium text-white">Match: </span>
                  {detailJob.match_percentage ? `${detailJob.match_percentage}%` : 'N/A'}
                </div>
              </div>
              {detailJob.required_skills?.length > 0 && (
                <div className="mt-4">
                  <p className="text-white font-semibold mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {detailJob.required_skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-blue-600/20 text-blue-200 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Referral Request Modal */}
        {showReferralModal && selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseReferralModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Request Referral</h3>
              <p className="text-gray-300 mb-2">Job: {selectedJob.title}</p>
              <p className="text-gray-400 text-sm mb-4">Company: {selectedJob.company}</p>

              <textarea
                rows={5}
                value={referralMessage}
                onChange={(e) => setReferralMessage(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Write a personal message to the alumni..."
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCloseReferralModal}
                  className="flex-1 py-3 rounded-xl glass text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReferral}
                  disabled={submitting || !referralMessage.trim()}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700/50 text-white"
                >
                  {submitting ? 'Sending...' : 'Send Referral'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
