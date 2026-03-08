import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { Input, Spinner } from '../components/ui';

const SKILLS_SUGGESTIONS = ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Java', 'SQL', 'AWS', 'Docker', 'TypeScript'];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [tab, setTab] = useState(searchParams.get('tab') === 'signup' ? 'signup' : 'login');
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [role, setRole] = useState(searchParams.get('role') || 'student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otp, setOtp] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    company: '', jobRole: '', yearsExperience: '', linkedinUrl: '',
    skills: [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addSkill = (skill) => {
    if (!form.skills.includes(skill)) set('skills', [...form.skills, skill]);
    setSkillInput('');
  };

  const removeSkill = (skill) => set('skills', form.skills.filter(s => s !== skill));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authAPI.signup({ ...form, role });
      setPendingUserId(res.userId);
      setDemoOtp(res.otp_demo || '');
      setStep(2);
    } catch (err) {
      setError(err.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authAPI.verifyOtp({ userId: pendingUserId, otp });
      localStorage.setItem('referx_token', res.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      if (err.userId) {
        setPendingUserId(err.userId);
        setStep(2);
      } else {
        setError(err.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040408] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-[#040408] to-[#0a0a14] items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#00FF87]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-[#00b4d8]/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center mx-auto mb-8">
            <span className="font-display font-bold text-[#00FF87] text-2xl">R</span>
          </div>
          <h2 className="font-display font-bold text-4xl mb-4 leading-tight">
            Your career starts with the right{' '}
            <span className="gradient-text">connection</span>
          </h2>
          <p className="text-white/40 leading-relaxed">
            Join thousands of students who landed jobs at Google, Meta, Netflix, and 900+ other companies through alumni referrals.
          </p>

          <div className="mt-12 space-y-4">
            {[
              '✓ Verified alumni network',
              '✓ Direct referral to hiring managers',
              '✓ AI-powered job matching',
              '✓ Real-time chat with mentors',
            ].map(f => (
              <div key={f} className="glass rounded-xl px-5 py-3 text-sm text-white/60 text-left">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:max-w-[500px] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/30 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to home
          </button>

          {step === 1 ? (
            <>
              {/* Tabs */}
              <div className="flex glass rounded-xl p-1 mb-8">
                {['login', 'signup'].map(t => (
                  <button key={t} onClick={() => { setTab(t); setError(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all
                      ${tab === t ? 'bg-[#00FF87] text-black' : 'text-white/40 hover:text-white'}`}>
                    {t === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {tab === 'signup' ? (
                <form onSubmit={handleSignup} className="space-y-5">
                  <h1 className="font-display font-bold text-2xl mb-1">Create your account</h1>
                  <p className="text-white/40 text-sm mb-6">Join ReferX and unlock your career potential.</p>

                  {/* Role selector */}
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">I am a...</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['student', 'alumni'].map(r => (
                        <button type="button" key={r} onClick={() => setRole(r)}
                          className={`py-3 rounded-xl text-sm font-medium capitalize border transition-all
                            ${role === r ? 'border-[#00FF87]/40 bg-[#00FF87]/10 text-[#00FF87]' : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white'}`}>
                          {r === 'student' ? '🎓 Student' : '💼 Alumni'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input label="Full Name" value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Priya Sharma" required />

                  <Input label={role === 'student' ? 'College Email (.edu / .ac.in)' : 'Work Email'}
                    type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder={role === 'student' ? 'priya@college.ac.in' : 'priya@company.com'} required />

                  <div className="relative">
                    <Input label="Password" type={showPass ? 'text' : 'password'}
                      value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="Min. 8 characters" required minLength={8} />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-9 text-white/30 hover:text-white transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {role === 'alumni' && (
                    <>
                      <Input label="Company" value={form.company} onChange={e => set('company', e.target.value)}
                        placeholder="Google, Microsoft, etc." />
                      <Input label="Job Role" value={form.jobRole} onChange={e => set('jobRole', e.target.value)}
                        placeholder="Senior Software Engineer" />
                      <Input label="Years of Experience" type="number" value={form.yearsExperience}
                        onChange={e => set('yearsExperience', e.target.value)} placeholder="3" />
                      <Input label="LinkedIn URL" value={form.linkedinUrl}
                        onChange={e => set('linkedinUrl', e.target.value)} placeholder="linkedin.com/in/yourname" />
                    </>
                  )}

                  {/* Skills */}
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.skills.map(s => (
                        <span key={s} className="flex items-center gap-1 bg-[#00FF87]/10 text-[#00FF87] text-xs px-2.5 py-1 rounded-full border border-[#00FF87]/20">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-400 ml-0.5">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), skillInput.trim() && addSkill(skillInput.trim()))}
                        className="input-field text-sm flex-1"
                        placeholder="Type skill and press Enter" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {SKILLS_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0,6).map(s => (
                        <button type="button" key={s} onClick={() => addSkill(s)}
                          className="text-xs bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full text-white/40 hover:text-white transition-all border border-white/5">
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>}

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                    {loading ? <Spinner size="sm" /> : 'Create Account'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  <h1 className="font-display font-bold text-2xl mb-1">Welcome back</h1>
                  <p className="text-white/40 text-sm mb-6">Sign in to continue your journey.</p>

                  <Input label="Email" type="email" value={form.email}
                    onChange={e => set('email', e.target.value)} placeholder="your@email.com" required />

                  <div className="relative">
                    <Input label="Password" type={showPass ? 'text' : 'password'}
                      value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="Your password" required />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-9 text-white/30 hover:text-white transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>}

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                    {loading ? <Spinner size="sm" /> : 'Sign In'}
                  </button>

                  <div className="glass rounded-xl p-4 text-xs text-white/40 space-y-1">
                    <p className="font-medium text-white/60">Demo accounts:</p>
                    <p>Admin: admin@referx.com / admin123</p>
                    <p>Student: student@college.edu / pass123</p>
                    <p>Alumni: alumni@company.com / pass123</p>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* OTP step */
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-[#00FF87]" size={28} />
                </div>
                <h1 className="font-display font-bold text-2xl mb-2">Verify your email</h1>
                <p className="text-white/40 text-sm">Enter the 6-digit OTP sent to your email.</p>
                {demoOtp && (
                  <div className="mt-3 glass rounded-xl p-3 border border-[#00FF87]/20 inline-block">
                    <p className="text-xs text-white/40">Demo OTP:</p>
                    <p className="font-mono font-bold text-[#00FF87] text-xl tracking-widest">{demoOtp}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block text-center">OTP Code (any 6 digits in demo)</label>
                <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                  className="input-field text-center text-2xl font-mono tracking-[0.5em] py-4"
                  placeholder="000000" maxLength={6} required />
              </div>

              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>}

              <button type="submit" disabled={loading || otp.length < 6}
                className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                {loading ? <Spinner size="sm" /> : 'Verify & Continue'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
