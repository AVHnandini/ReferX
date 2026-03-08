import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { usersAPI, resumeAPI } from '../services/api';
import { Avatar, ProgressBar, Badge, Spinner, Input, Textarea } from '../components/ui';
import { Edit2, Save, Plus, X, ExternalLink, Star, Zap } from 'lucide-react';

const SKILLS_POOL = ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Express', 'Django', 'FastAPI', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'GCP', 'Docker', 'Kubernetes', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'UI/UX', 'Figma', 'Product Management', 'Agile', 'Git', 'TypeScript', 'GraphQL', 'REST'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    company: user?.company || '',
    job_role: user?.job_role || '',
    years_experience: user?.years_experience || '',
    linkedin_url: user?.linkedin_url || '',
    skills: user?.skills || [],
  });

  useEffect(() => {
    resumeAPI.analyze().then(setResumeData).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = (s) => {
    const trimmed = s.trim();
    if (trimmed && !form.skills.includes(trimmed)) set('skills', [...form.skills, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));

  const save = async () => {
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile(form);
      updateUser(res.user);
      setEditing(false);
    } catch (err) {
      alert(err.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const scoreCategories = [
    { label: 'Name & Email', done: !!user?.name && !!user?.email, pts: 15 },
    { label: 'Bio', done: !!user?.bio, pts: 15 },
    { label: 'Profile Photo', done: !!user?.avatar_url, pts: 10 },
    { label: 'Skills (3+)', done: (user?.skills?.length || 0) >= 3, pts: 20 },
    { label: 'Resume', done: !!user?.resume_url, pts: 20 },
    { label: 'LinkedIn', done: !!user?.linkedin_url, pts: 10 },
    { label: 'Company', done: !!user?.company, pts: 10 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header card */}
        <div className="card relative">
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="absolute top-5 right-5 flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg">
              <Edit2 size={13} /> Edit Profile
            </button>
          ) : (
            <div className="absolute top-5 right-5 flex gap-2">
              <button onClick={save} disabled={saving}
                className="flex items-center gap-1.5 text-xs bg-[#00FF87] text-black px-3 py-1.5 rounded-lg font-medium hover:bg-[#00e67a] transition-all">
                {saving ? <Spinner size="sm" /> : <><Save size={13} /> Save</>}
              </button>
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 text-xs bg-white/5 text-white/40 hover:text-white px-3 py-1.5 rounded-lg transition-all">
                <X size={13} /> Cancel
              </button>
            </div>
          )}

          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar name={user?.name} src={user?.avatar_url} size="xl" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00FF87] flex items-center justify-center cursor-pointer hover:bg-[#00e67a] transition-all">
                <Plus size={14} className="text-black" />
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-2">
              {editing ? (
                <div className="space-y-3">
                  <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" />
                  <Textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Write a short bio about yourself..." rows={2} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company" />
                    <Input value={form.job_role} onChange={e => set('job_role', e.target.value)} placeholder="Job role" />
                  </div>
                  <Input value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="LinkedIn URL" />
                </div>
              ) : (
                <>
                  <h1 className="font-display font-bold text-2xl mb-1">{user?.name}</h1>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {user?.job_role && <span className="text-white/50 text-sm">{user.job_role}</span>}
                    {user?.company && (
                      <span className="text-sm text-[#00FF87] font-medium">@ {user.company}</span>
                    )}
                    <Badge variant={user?.role === 'admin' ? 'purple' : user?.role === 'alumni' ? 'blue' : 'accent'}>
                      {user?.role}
                    </Badge>
                    {user?.verification_status === 'approved' && <Badge variant="green">✓ Verified</Badge>}
                  </div>
                  {user?.bio && <p className="text-white/50 text-sm leading-relaxed">{user.bio}</p>}
                  {user?.linkedin_url && (
                    <a href={user.linkedin_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-2">
                      <ExternalLink size={11} /> LinkedIn Profile
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile score */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-sm">Profile Strength</h3>
              <span className="font-bold text-[#00FF87]">{user?.profile_score || 0}%</span>
            </div>
            <ProgressBar value={user?.profile_score || 0} className="mb-5" />

            <div className="space-y-2">
              {scoreCategories.map(c => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={c.done ? 'text-[#00FF87]' : 'text-white/20'}>{c.done ? '✓' : '○'}</span>
                  <span className={c.done ? 'text-white/60 line-through' : 'text-white/40'}>{c.label}</span>
                  <span className="ml-auto text-white/20">+{c.pts}%</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                <span className="text-xs text-white/40">Points: <span className="text-amber-400 font-bold">{user?.points || 0}</span></span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Skills</h3>
              {editing && <span className="text-xs text-white/30">{form.skills.length} skills added</span>}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {(editing ? form.skills : user?.skills || []).map(s => (
                <div key={s} className="flex items-center gap-1 bg-[#00FF87]/10 text-[#00FF87] text-sm px-3 py-1.5 rounded-xl border border-[#00FF87]/20">
                  {s}
                  {editing && (
                    <button onClick={() => removeSkill(s)} className="hover:text-red-400 ml-1 transition-colors">×</button>
                  )}
                </div>
              ))}
              {!editing && (user?.skills || []).length === 0 && (
                <p className="text-white/20 text-sm">No skills added yet</p>
              )}
            </div>

            {editing && (
              <>
                <div className="flex gap-2">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), skillInput.trim() && addSkill(skillInput))}
                    className="input-field text-sm flex-1 py-2" placeholder="Add skill and press Enter" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {SKILLS_POOL.filter(s => !form.skills.includes(s)).slice(0, 10).map(s => (
                    <button key={s} onClick={() => addSkill(s)}
                      className="text-xs bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full text-white/40 hover:text-white transition-all border border-white/5">
                      + {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resume analyzer */}
        {resumeData && (
          <div className="card">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Star size={18} className="text-[#00FF87]" /> Resume Analysis
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-white/40 mb-2">Resume Score</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-display font-bold text-4xl text-[#00FF87]">{resumeData.score}</span>
                  <span className="text-white/30 mb-1">/100</span>
                </div>
                <ProgressBar value={resumeData.score} />
              </div>

              <div>
                <p className="text-xs text-white/40 mb-2">Detected Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {(resumeData.keywords || []).slice(0, 8).map(k => (
                    <Badge key={k} variant="blue">{k}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-white/40 mb-2">Suggestions</p>
                <ul className="space-y-1.5">
                  {(resumeData.suggestions || []).slice(0, 4).map((s, i) => (
                    <li key={i} className="text-xs text-white/50 flex gap-2">
                      <span className="text-amber-400 flex-shrink-0">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
