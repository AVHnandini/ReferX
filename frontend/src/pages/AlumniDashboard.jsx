import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, referralsAPI } from '../services/api';
import { Avatar, Badge, StatusBadge, Skeleton, EmptyState, Modal, Input, Textarea, Select } from '../components/ui';
import { Briefcase, BookOpen, Users, Plus, CheckCircle, XCircle, ArrowRight, Edit } from 'lucide-react';

function AlumniHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      referralsAPI.getAlumniReferrals().then(d => setReferrals(d.referrals || [])),
      jobsAPI.getAll().then(d => setJobs(d.jobs?.filter(j => j.posted_by === user.id) || [])),
    ]).finally(() => setLoading(false));
  }, [user.id]);

  const pending = referrals.filter(r => r.status === 'pending');

  const stats = [
    { label: 'Pending Requests', value: pending.length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Students Referred', value: referrals.filter(r => r.status === 'referred').length, color: 'text-[#00FF87]', bg: 'bg-[#00FF87]/10' },
    { label: 'Jobs Posted', value: jobs.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Requests', value: referrals.length, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const handleRespond = async (id, status, feedback = '') => {
    try {
      await referralsAPI.respond(id, { status, feedback });
      setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-white/40">Manage your referrals and help students land their dream jobs</p>
          {user?.verification_status !== 'approved' && (
            <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-sm text-amber-400">
              ⏳ Your account is pending admin verification
            </div>
          )}
        </div>
        <button onClick={() => navigate('/alumni/jobs')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Post Job
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="font-display font-bold text-3xl mb-1">{value}</div>
            <div className="text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending referral requests */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold">Pending Requests ({pending.length})</h3>
          <button onClick={() => navigate('/alumni/referrals')} className="text-xs text-[#00FF87] hover:underline">View all</button>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28" />)}</div>
        ) : pending.length === 0 ? (
          <EmptyState icon={BookOpen} title="No pending requests" description="Students will send referral requests here" />
        ) : (
          <div className="space-y-4">
            {pending.slice(0, 5).map(r => (
              <div key={r.id} className="glass rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={r.student?.name} src={r.student?.avatar_url} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{r.student?.name}</p>
                      <Badge variant="yellow">Pending</Badge>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">For: {r.job?.title} @ {r.job?.company}</p>
                    {r.message && <p className="text-xs text-white/50 mt-1 italic">"{r.message}"</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(r.student?.skills || []).slice(0,4).map(s => (
                        <span key={s} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleRespond(r.id, 'referred')}
                    className="flex-1 btn-primary text-xs py-2 rounded-lg flex items-center justify-center gap-1">
                    <CheckCircle size={14} /> Refer
                  </button>
                  <button onClick={() => handleRespond(r.id, 'accepted')}
                    className="flex-1 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1 border border-blue-500/20">
                    <ArrowRight size={14} /> Accept
                  </button>
                  <button onClick={() => handleRespond(r.id, 'rejected')}
                    className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1 border border-red-500/20">
                    <XCircle size={14} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Posted jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Jobs I've Posted</h3>
          <button onClick={() => navigate('/alumni/jobs')} className="text-xs text-[#00FF87] hover:underline">Manage</button>
        </div>
        {jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs posted yet"
            action={<button onClick={() => navigate('/alumni/jobs')} className="btn-primary text-sm">Post a Job</button>} />
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {jobs.slice(0, 4).map(j => (
              <div key={j.id} className="glass rounded-xl p-4">
                <p className="font-medium text-sm">{j.title}</p>
                <p className="text-xs text-white/40">{j.company} · {j.location}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {(j.required_skills || []).slice(0,3).map(s => (
                    <span key={s} className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlumniReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    referralsAPI.getAlumniReferrals().then(d => setReferrals(d.referrals || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? referrals : referrals.filter(r => r.status === filter);

  const respond = async (id, status) => {
    await referralsAPI.respond(id, { status }).catch(() => {});
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-2xl">Referral Requests</h2>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'accepted', 'rejected', 'referred'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
                ${filter === s ? 'bg-[#00FF87] text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No requests" />
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-start gap-4">
                <Avatar name={r.student?.name} src={r.student?.avatar_url} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                    <h4 className="font-semibold">{r.student?.name}</h4>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-white/40 mb-1">Requesting referral for: <span className="text-white/60">{r.job?.title}</span></p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(r.student?.skills || []).slice(0,5).map(s => (
                      <span key={s} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                  {r.message && <p className="text-sm text-white/50 italic bg-white/3 rounded-lg p-3 mb-3">"{r.message}"</p>}
                  {r.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => respond(r.id, 'referred')} className="btn-primary text-xs py-1.5 px-4 rounded-lg">Refer ✓</button>
                      <button onClick={() => respond(r.id, 'accepted')} className="btn-ghost text-xs py-1.5 px-4 rounded-lg">Accept</button>
                      <button onClick={() => respond(r.id, 'rejected')} className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-1.5 rounded-lg border border-red-500/20 transition-all">Decline</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AlumniJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '', company: user?.company || '', description: '', location: '',
    requiredSkills: [], salaryMin: '', salaryMax: '', applicationLink: '', jobType: 'Full-time',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    jobsAPI.getAll().then(d => setJobs(d.jobs?.filter(j => j.posted_by === user.id) || [])).finally(() => setLoading(false));
  }, [user.id]);

  const postJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const res = await jobsAPI.create(form);
      setJobs(j => [res.job, ...j]);
      setShowModal(false);
      setForm({ title: '', company: user?.company || '', description: '', location: '', requiredSkills: [], salaryMin: '', salaryMax: '', applicationLink: '', jobType: 'Full-time' });
    } catch (err) {
      alert(err.error || 'Failed to post job');
    } finally {
      setPosting(false);
    }
  };

  const addSkill = (s) => { if (s && !form.requiredSkills.includes(s)) set('requiredSkills', [...form.requiredSkills, s]); setSkillInput(''); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-2xl">My Job Postings</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Post New Job
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs posted" description="Post your first job opening for students to apply"
          action={<button onClick={() => setShowModal(true)} className="btn-primary text-sm">Post a Job</button>} />
      ) : (
        <div className="space-y-4">
          {jobs.map(j => (
            <div key={j.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{j.title}</h3>
                  <p className="text-sm text-white/40">{j.company} · {j.location} · {j.job_type}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {(j.required_skills || []).map(s => (
                      <span key={s} className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                  {j.salary_min && <p className="text-xs text-[#00FF87] mt-2">₹{j.salary_min.toLocaleString()} – ₹{j.salary_max?.toLocaleString()}/yr</p>}
                </div>
                <Badge variant="green">Active</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Post a Job Opening" size="lg">
        <form onSubmit={postJob} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Job Title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Software Engineer" required />
            <Input label="Company" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Bangalore, India" />
            <Select label="Job Type" value={form.jobType} onChange={e => set('jobType', e.target.value)}>
              {['Full-time', 'Internship', 'Contract', 'Part-time'].map(t => <option key={t}>{t}</option>)}
            </Select>
          </div>
          <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Job description..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Salary (₹/yr)" type="number" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} />
            <Input label="Max Salary (₹/yr)" type="number" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} />
          </div>
          <Input label="Application Link" value={form.applicationLink} onChange={e => set('applicationLink', e.target.value)} placeholder="https://..." />
          <div>
            <label className="text-sm text-white/60 mb-2 block">Required Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.requiredSkills.map(s => (
                <span key={s} className="flex items-center gap-1 bg-[#00FF87]/10 text-[#00FF87] text-xs px-2.5 py-1 rounded-full border border-[#00FF87]/20">
                  {s} <button type="button" onClick={() => set('requiredSkills', form.requiredSkills.filter(x => x !== s))}>×</button>
                </span>
              ))}
            </div>
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput.trim()))}
              className="input-field text-sm" placeholder="Type skill and press Enter" />
          </div>
          <button type="submit" disabled={posting} className="btn-primary w-full py-3 rounded-xl">
            {posting ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default function AlumniDashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<AlumniHome />} />
        <Route path="referrals" element={<AlumniReferrals />} />
        <Route path="jobs" element={<AlumniJobs />} />
      </Routes>
    </DashboardLayout>
  );
}
