import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, GraduationCap, Building, Plus, X, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import ProfileCard from '../../components/student/ProfileCard';
import ResumeUpload from '../../components/student/ResumeUpload';

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    college: user?.college || '',
    course: user?.course || '',
    skills: user?.skills || [],
    bio: user?.bio || '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [resume, setResume] = useState(user?.resume || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const setField = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(p => ({ ...p, skills: [...p.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userService.updateProfile({ ...form, resume });
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = (resumeData) => {
    setResume(resumeData);
  };

  const handleResumeRemove = () => {
    setResume(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">
            Complete your profile to get better job recommendations and increase your referral chances
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <ProfileCard user={{ ...user, ...form, resume }} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={setField('name')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    College Name
                  </label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={form.college}
                      onChange={setField('college')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Enter your college name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Course / Branch
                  </label>
                  <div className="relative">
                    <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={form.course}
                      onChange={setField('course')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="e.g., Computer Science, Mechanical Engineering"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={setField('bio')}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  placeholder="Tell us about yourself, your interests, and career goals..."
                />
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">Skills</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-4 py-3 rounded-xl glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Add a skill (e.g., React, Python, Data Analysis)"
                />
                <button
                  onClick={addSkill}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 bg-white/10 text-gray-300 px-3 py-2 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {form.skills.length === 0 && (
                <p className="text-gray-500 text-sm">
                  Add your technical skills to improve job matching and profile strength
                </p>
              )}
            </motion.div>

            {/* Resume Upload */}
            <ResumeUpload
              currentResume={resume}
              onUpload={handleResumeUpload}
              onRemove={handleResumeRemove}
            />

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {saved && (
                  <>
                    <CheckCircle size={20} className="text-green-400" />
                    <span className="text-green-400 font-medium">Profile updated successfully!</span>
                  </>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-medium transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
