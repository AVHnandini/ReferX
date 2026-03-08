import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Linkedin, Plus, X, Upload, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService, resumeService } from '../../services/api';

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    linkedin: user?.linkedin || '',
    skills: user?.skills || [],
    resume: user?.resume || '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const addSkill = () => {
    if (newSkill && !form.skills.includes(newSkill)) {
      setForm(p => ({ ...p, skills: [...p.skills, newSkill] }));
      setNewSkill('');
    }
  };

  const removeSkill = (s) => setForm(p => ({ ...p, skills: p.skills.filter(sk => sk !== s) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(form);
      setUser(data); setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleAnalyze = async () => {
    if (!resumeText) return;
    setAnalyzing(true);
    try {
      const { data } = await resumeService.analyze(resumeText);
      setAnalysis(data);
      setForm(p => ({ ...p, skills: [...new Set([...p.skills, ...data.extractedSkills])] }));
    } catch (err) { console.error(err); }
    finally { setAnalyzing(false); }
  };

  const profileScore = user?.profile_score || 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Build a strong profile to attract referrals</p>
      </div>

      {/* Score */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2"><Zap size={16} className="text-brand-400" /> Profile Strength</h3>
          <span className="text-brand-400 font-bold text-lg">{profileScore}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-3">
          <motion.div initial={{ width: 0 }} animate={{ width: `${profileScore}%` }} transition={{ duration: 1 }}
            className="h-3 bg-gradient-to-r from-brand-500 to-accent-cyan rounded-full" />
        </div>
      </div>

      {/* Basic Info */}
      <div className="card space-y-4">
        <h3 className="font-display font-bold">Basic Info</h3>
        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input placeholder="Full Name" value={form.name} onChange={set('name')} className="input pl-11" />
        </div>
        <div className="relative">
          <Linkedin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input placeholder="LinkedIn URL" value={form.linkedin} onChange={set('linkedin')} className="input pl-11" />
        </div>
      </div>

      {/* Skills */}
      <div className="card space-y-4">
        <h3 className="font-display font-bold">Skills</h3>
        <div className="flex gap-2">
          <input placeholder="Add a skill..." value={newSkill} onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()} className="input flex-1" />
          <button onClick={addSkill} className="btn-primary px-4 py-3"><Plus size={16} /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.skills.map(s => (
            <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm">
              {s}
              <button onClick={() => removeSkill(s)} className="hover:text-white"><X size={12} /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Resume Analyzer */}
      <div className="card space-y-4">
        <h3 className="font-display font-bold flex items-center gap-2"><Upload size={16} className="text-accent-cyan" /> Resume Analyzer</h3>
        <p className="text-sm text-gray-400">Paste your resume text to analyze skills and get a score.</p>
        <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
          placeholder="Paste your resume content here..."
          className="input min-h-40 resize-y text-sm" />
        <button onClick={handleAnalyze} disabled={analyzing || !resumeText}
          className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {analyzing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap size={16} /> Analyze Resume</>}
        </button>

        {analysis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 p-4 rounded-xl glass">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Resume Score</span>
              <span className="font-display text-2xl font-bold text-accent-lime">{analysis.score}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div className="h-2 bg-gradient-to-r from-accent-lime to-accent-cyan rounded-full" style={{ width: `${analysis.score}%` }} />
            </div>
            {analysis.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Suggestions</p>
                {analysis.suggestions.map((s, i) => (
                  <p key={i} className="text-xs text-amber-400 flex items-center gap-2">
                    <Zap size={10} /> {s}
                  </p>
                ))}
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Detected Skills</p>
              <div className="flex flex-wrap gap-1">
                {analysis.extractedSkills.map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">{s}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2">
        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
          : saved ? '✓ Saved!' : 'Save Profile'}
      </button>
    </div>
  );
}
