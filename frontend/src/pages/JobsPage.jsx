import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { jobsAPI, referralsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, StatusBadge, Skeleton, EmptyState, Modal, Input, Textarea, Select, Spinner } from '../components/ui';
import { Search, Briefcase, MapPin, DollarSign, Users, Bookmark, ExternalLink, ArrowRight } from 'lucide-react';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [showReferModal, setShowReferModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState('');
  const [message, setMessage] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [saved, setSaved] = useState(new Set());

  useEffect(() => {
    const load = user?.role === 'student' ? jobsAPI.getRecommended() : jobsAPI.getAll();
    load.then(d => setJobs(d.jobs || [])).finally(() => setLoading(false));
    if (user?.role === 'student') {
      usersAPI.getAlumni().then(d => setAlumni(d.alumni || []));
    }
  }, [user?.role]);

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenReferModal = (job) => {
    console.log('Referral button clicked', job);
    if (!job) return;

    setSelectedJob(job);
    setShowReferModal(true);
    setMessage(`Hi, I\'m interested in ${job.title} at ${job.company}. I would appreciate your referral.`);

    const defaultAlumni = job.poster?._id || job.postedBy || job.posted_by;
    if (defaultAlumni) {
      setSelectedAlumni(defaultAlumni);
    } else if (alumni.length > 0) {
      setSelectedAlumni(alumni[0]._id || alumni[0].id);
    }
  };

  const requestReferral = async (e) => {
    e.preventDefault();
    if (!selectedAlumni || !selectedJob) return;

    setRequesting(true);
    try {
      console.log('Sending referral request', {
        jobId: selectedJob._id || selectedJob.id,
        alumniId: selectedAlumni,
        message,
      });

      await referralsAPI.request({
        jobId: selectedJob._id || selectedJob.id,
        alumniId: selectedAlumni,
        message,
      });

      setShowReferModal(false);
      setMessage('');
      setSelectedAlumni('');
      alert('Referral request sent!');
      console.log('Referral saved');
    } catch (err) {
      console.error('Referral request error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send request';
      alert(errorMessage);
    } finally {
      setRequesting(false);
    }
  };

  const saveJob = async (jobId) => {
    try {
      await jobsAPI.save(jobId);
      setSaved(s => new Set([...s, jobId]));
    } catch {}
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl">
              {user?.role === 'student' ? 'Recommended Jobs' : 'Browse Jobs'}
            </h1>
            <p className="text-white/40 text-sm mt-1">{filtered.length} opportunities found</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 w-72 text-sm py-2.5" placeholder="Search jobs, companies..." />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs found" description="Try adjusting your search" />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(job => (
              <div key={job.id} className="glass glass-hover rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 group"
                onClick={() => setSelectedJob(job)}>
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-lg font-bold text-white/40">
                      {job.company?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{job.title}</h3>
                      <p className="text-xs text-white/40">{job.company}</p>
                    </div>
                  </div>
                  {job.match_percentage && (
                    <Badge variant="accent" className="flex-shrink-0">{job.match_percentage}%</Badge>
                  )}
                </div>

                {/* Location & type */}
                <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
                  {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                  {job.job_type && <span className="flex items-center gap-1"><Briefcase size={11} />{job.job_type}</span>}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(job.required_skills || []).slice(0, 4).map(s => (
                    <span key={s} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-md">{s}</span>
                  ))}
                  {(job.required_skills || []).length > 4 && (
                    <span className="text-xs text-white/20">+{job.required_skills.length - 4} more</span>
                  )}
                </div>

                {/* Salary */}
                {job.salary_min && (
                  <p className="text-xs text-[#00FF87] mb-3 flex items-center gap-1">
                    <DollarSign size={11} />₹{job.salary_min.toLocaleString()} – ₹{job.salary_max?.toLocaleString()}/yr
                  </p>
                )}

                {/* Posted by */}
                {job.poster && (
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <Avatar name={job.poster.name} src={job.poster.avatar_url} size="sm" />
                    <div>
                      <p className="text-xs text-white/50">{job.poster.name}</p>
                      <p className="text-[10px] text-white/30">{job.poster.job_role}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-all">
                  {user?.role === 'student' && (
                    <>
                              <button onClick={e => { e.stopPropagation(); handleOpenReferModal(job); }}
                        className="flex-1 btn-primary text-xs py-2 rounded-lg flex items-center justify-center gap-1">
                        Request Referral <ArrowRight size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); saveJob(job.id); }}
                        className={`w-9 h-8 rounded-lg flex items-center justify-center border transition-all
                          ${saved.has(job.id) ? 'bg-[#00FF87]/15 border-[#00FF87]/30 text-[#00FF87]' : 'border-white/10 text-white/30 hover:text-white'}`}>
                        <Bookmark size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job detail modal */}
        <Modal isOpen={!!selectedJob && !showReferModal} onClose={() => setSelectedJob(null)} title={selectedJob?.title} size="lg">
          {selectedJob && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-white/60">{selectedJob.company}</p>
                  <div className="flex items-center gap-3 text-xs text-white/30 mt-1">
                    {selectedJob.location && <span className="flex items-center gap-1"><MapPin size={11} />{selectedJob.location}</span>}
                    {selectedJob.job_type && <span>{selectedJob.job_type}</span>}
                  </div>
                </div>
                {selectedJob.salary_min && (
                  <Badge variant="accent">₹{selectedJob.salary_min.toLocaleString()} – ₹{selectedJob.salary_max?.toLocaleString()}/yr</Badge>
                )}
              </div>

              {selectedJob.description && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">About the role</h4>
                  <p className="text-sm text-white/50 leading-relaxed">{selectedJob.description}</p>
                </div>
              )}

              {selectedJob.required_skills?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.required_skills.map(s => (
                      <Badge key={s} variant="blue">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {user?.role === 'student' && (
                  <button onClick={() => setShowReferModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                    Request Referral <ArrowRight size={16} />
                  </button>
                )}
                {selectedJob.application_link && (
                  <a href={selectedJob.application_link} target="_blank" rel="noreferrer"
                    className="btn-ghost flex items-center gap-2 text-sm">
                    Apply Direct <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Referral request modal */}
        <Modal isOpen={showReferModal} onClose={() => { setShowReferModal(false); }} title="Request a Referral" size="md">
          <form onSubmit={requestReferral} className="space-y-4">
            <div className="glass rounded-xl p-3 mb-2">
              <p className="text-xs text-white/40">Requesting for:</p>
              <p className="font-semibold text-sm">{selectedJob?.title}</p>
              <p className="text-xs text-white/50">{selectedJob?.company}</p>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Choose Alumni</label>
              <select value={selectedAlumni} onChange={e => setSelectedAlumni(e.target.value)}
                className="input-field" required>
                <option value="">Select an alumni...</option>
                {alumni.filter(a => !a.company || a.company.toLowerCase().includes(selectedJob?.company?.toLowerCase() || '')).map(a => (
                  <option key={a._id || a.id} value={a._id || a.id}>{a.name} — {a.jobRole || a.job_role || ''} @ {a.company}</option>
                ))}
                {alumni.length > 0 && <option disabled>──────────────</option>}
                {alumni.map(a => (
                  <option key={`all-${a._id || a.id}`} value={a._id || a.id}>{a.name} — {a.company}</option>
                ))}
              </select>
            </div>

            <Textarea label="Personal Message" value={message} onChange={e => setMessage(e.target.value)}
              rows={3} placeholder="Hi! I'm applying for this role and would appreciate a referral. Here's why I'm a good fit..." />

            <button type="submit" disabled={requesting || !selectedAlumni} className="btn-primary w-full py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {requesting ? <Spinner size="sm" /> : 'Send Referral Request'}
            </button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
