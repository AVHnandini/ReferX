import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, ArrowRight } from 'lucide-react';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { email, devOtp } = location.state || {};
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!email) navigate('/signup'); }, [email]);
  useEffect(() => { refs[0].current?.focus(); }, []);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) return;
    setLoading(true); setError('');
    try {
      const { data } = await authService.verifyOtp({ email, otp });
      login(data.token, data.user);
      navigate('/' + data.user.role);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const fillDevOtp = () => {
    if (devOtp) setDigits(devOtp.split(''));
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-80 h-80 bg-brand-600/20 rounded-full blur-3xl top-0 left-0 animate-float" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Verify your email</h1>
          <p className="text-gray-400 text-sm mb-2">Enter the 6-digit code sent to</p>
          <p className="text-brand-400 font-medium mb-8">{email}</p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-6">
              {digits.map((d, i) => (
                <input key={i} ref={refs[i]} value={d} maxLength={1}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold glass rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-white transition-all"
                />
              ))}
            </div>

            {error && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg mb-4">{error}</p>}

            <button type="submit" disabled={loading || digits.join('').length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify & Continue <ArrowRight size={16} /></>}
            </button>
          </form>

          {devOtp && (
            <div className="mt-6 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
              <p className="text-xs text-brand-400 font-medium mb-2">Dev Mode — Your OTP:</p>
              <p className="font-mono text-2xl font-bold text-white tracking-widest">{devOtp}</p>
              <button onClick={fillDevOtp} className="text-xs text-brand-400 mt-2 hover:text-brand-300">
                Click to autofill
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
