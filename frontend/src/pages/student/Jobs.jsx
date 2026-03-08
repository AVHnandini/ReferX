import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building, DollarSign, GitBranch, X, ChevronRight, Briefcase } from 'lucide-react';
import { jobService, referralService, userService } from '../../services/api';

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [requestModal, setRequestModal] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [alumni, setAlumni] = useState([]);

  useEffect(() => {
    Promise.all([jobService.getRecommended(), userService.getAllUsers()])
      .then(([j, u]) => {
        setJobs(j.data);
        setAlumni(u.data.filter(u => u.role === 'alumni' && u.verification_status === 'approved'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRequest = async () => {
    if (!requestModal) return;
    setSubmitting(true);
    try {
      const alumniForJob = alumni.find(a => a.company === requestModal.company);
      if (!alumniForJob) { alert('No verified alumni found for this company.'); return; }
      await referralService.request({ alumni_id: alumniForJob.id, job_id: requestModal.id, message });
      setSuccess('Referral request sent!');
      setRequestModal(null); setMessage('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Job Board</h1>
        <p className="text-gray-400 text-sm mt-1">Browse and request referrals for open positions</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input placeholder="Search jobs, companies, locations..." value={search}
          onChange={e => setSearch(e.target.value)} className="input pl-11" />
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-accent-lime/10 border border-accent-lime/30 text-accent-lime text-sm">
          {success}
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="glass rounded-2xl h-48 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List */}
          <div className="lg:col-span-2 space-y-4">
            {filtered.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">
                <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                <p>No jobs found. Check back soon!</p>
              </div>
            ) : filtered.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(job)}
                className={`card cursor-pointer hover:bg-white/10 transition-all group ${selected?.id === job.id ? 'border-brand-500/40 bg-brand-500/5' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {job.company?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{job.title}</h3>
                      <p className="text-sm text-gray-400">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {job.match_percentage > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-accent-lime/10 text-accent-lime font-bold">
                        {job.match_percentage}% match
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign size={12} />{job.salary}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {(job.required_skills || []).slice(0, 4).map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full glass text-gray-300">{s}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="card sticky top-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-display font-bold text-lg">{selected.title}</h2>
                      <p className="text-brand-400 font-medium">{selected.company}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-1 rounded-lg glass text-gray-400 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2"><MapPin size={14} />{selected.location}</div>
                    <div className="flex items-center gap-2"><DollarSign size={14} />{selected.salary}</div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{selected.description}</p>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {(selected.required_skills || []).map(s => (
                        <span key={s} className="text-xs px-2 py-1 rounded-full bg-brand-500/10 text-brand-400">{s}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setRequestModal(selected)}
                    className="btn-primary w-full flex items-center justify-center gap-2">
                    <GitBranch size={16} /> Request Referral
                  </button>
                  {selected.application_link && (
                    <a href={selected.application_link} target="_blank" rel="noopener noreferrer"
                      className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                      Apply Directly <ChevronRight size={14} />
                    </a>
                  )}
                </motion.div>
              ) : (
                <div className="card text-center py-12 text-gray-500">
                  <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Select a job to view details</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Referral Request Modal */}
      <AnimatePresence>
        {requestModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setRequestModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-display font-bold text-lg mb-1">Request Referral</h3>
              <p className="text-gray-400 text-sm mb-4">{requestModal.title} at {requestModal.company}</p>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Write a personal message to the alumni — mention your background, why you're interested, etc."
                className="input min-h-28 resize-none text-sm" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setRequestModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleRequest} disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Request'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
