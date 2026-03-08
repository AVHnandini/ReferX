import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Briefcase, MapPin, DollarSign, Trash2 } from 'lucide-react';
import { jobService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EMPTY = { title: '', company: '', location: '', description: '', required_skills: [], salary: '', application_link: '' };

export default function AlumniJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    jobService.getAllJobs().then(r => setJobs(r.data.filter(j => j.posted_by === user?.id))).finally(() => setLoading(false));
  }, [user]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const addSkill = () => { if (newSkill) { setForm(p => ({ ...p, required_skills: [...p.required_skills, newSkill] })); setNewSkill(''); } };
  const removeSkill = s => setForm(p => ({ ...p, required_skills: p.required_skills.filter(x => x !== s) }));

  const handleCreate = async e => {
    e.preventDefault(); setSubmitting(true);
    try {
      const { data } = await jobService.createJob(form);
      setJobs(p => [data, ...p]);
      setShowForm(false); setForm(EMPTY);
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Remove this job?')) return;
    await jobService.deleteJob(id);
    setJobs(p => p.filter(j => j.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Job Posts</h1>
          <p className="text-gray-400 text-sm mt-1">Manage openings at {user?.company}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Post Job
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl h-32 animate-pulse" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
          <h3 className="font-semibold mb-2">No jobs posted yet</h3>
          <button onClick={() => setShowForm(true)} className="text-brand-400 text-sm hover:underline">Post your first job →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card relative group">
              <button onClick={() => handleDelete(job.id)}
                className="absolute top-4 right-4 p-1.5 rounded-lg glass text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={14} />
              </button>
              <h3 className="font-semibold text-white pr-8">{job.title}</h3>
              <p className="text-brand-400 text-sm">{job.company}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                <span className="flex items-center gap-1"><DollarSign size={11} />{job.salary}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{job.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {(job.required_skills || []).map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400">{s}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass rounded-2xl p-6 w-full max-w-lg my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-lg">Post a Job</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg glass text-gray-400 hover:text-white"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <input placeholder="Job Title *" value={form.title} onChange={set('title')} className="input" required />
                <input placeholder="Company *" value={form.company} onChange={set('company')} className="input" required />
                <input placeholder="Location (e.g. Remote, Bangalore)" value={form.location} onChange={set('location')} className="input" required />
                <textarea placeholder="Job description..." value={form.description} onChange={set('description')} className="input min-h-24 resize-none" required />
                <input placeholder="Salary range (e.g. ₹20-30 LPA)" value={form.salary} onChange={set('salary')} className="input" />
                <input placeholder="Application link" value={form.application_link} onChange={set('application_link')} className="input" />
                <div className="flex gap-2">
                  <input placeholder="Add required skill..." value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="input flex-1 text-sm" />
                  <button type="button" onClick={addSkill} className="btn-secondary px-4">Add</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.required_skills.map(s => (
                    <span key={s} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-brand-500/10 text-brand-400">
                      {s} <button type="button" onClick={() => removeSkill(s)}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Post Job'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
