import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Briefcase, MessageSquare, Star, TrendingUp, Shield, Zap, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const STATS = [
  { value: '12,400+', label: 'Students placed' },
  { value: '3,200+', label: 'Alumni mentors' },
  { value: '890+', label: 'Companies' },
  { value: '94%', label: 'Referral success' },
];

const FEATURES = [
  {
    icon: Users,
    title: 'Alumni Network',
    desc: 'Connect with thousands of verified alumni working at top tech companies, startups, and Fortune 500 firms.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    accent: '#00FF87',
  },
  {
    icon: Briefcase,
    title: 'Smart Job Matching',
    desc: 'AI-powered recommendations that match your skills and interests to the most relevant opportunities.',
    color: 'from-blue-500/20 to-blue-500/5',
    accent: '#00b4d8',
  },
  {
    icon: MessageSquare,
    title: 'Direct Chat',
    desc: 'Real-time messaging with alumni mentors. Get feedback on your resume and ace your interviews.',
    color: 'from-purple-500/20 to-purple-500/5',
    accent: '#a855f7',
  },
  {
    icon: Shield,
    title: 'Verified Alumni',
    desc: 'Every alumni is manually verified by our team. No fake profiles, no spam — just real connections.',
    color: 'from-amber-500/20 to-amber-500/5',
    accent: '#f59e0b',
  },
  {
    icon: TrendingUp,
    title: 'Career Insights',
    desc: 'Track your profile strength, referral status, and career progress with detailed analytics.',
    color: 'from-rose-500/20 to-rose-500/5',
    accent: '#f43f5e',
  },
  {
    icon: Zap,
    title: 'Instant Referrals',
    desc: 'Request internal referrals with one click. Alumni can refer you directly to their hiring teams.',
    color: 'from-cyan-500/20 to-cyan-500/5',
    accent: '#06b6d4',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create your profile', desc: 'Sign up with your college email, add your skills, upload your resume, and set your career goals.' },
  { step: '02', title: 'Discover jobs & alumni', desc: 'Browse verified job listings and find alumni mentors from companies you want to join.' },
  { step: '03', title: 'Request a referral', desc: 'Send a personalized referral request to the right alumni with your resume and message.' },
  { step: '04', title: 'Land the interview', desc: 'Alumni refer you internally, bypassing ATS systems. You get a direct line to the hiring team.' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'SWE @ Google',
    company: 'Google',
    text: 'ReferX connected me with a Google engineer who referred me directly. I went from zero responses to an offer in 3 weeks.',
    rating: 5,
  },
  {
    name: 'Arjun Mehta',
    role: 'Product Manager @ Atlassian',
    company: 'Atlassian',
    text: 'As an alumni, I love being able to help students from my college. The platform makes it seamless to review profiles and refer the best candidates.',
    rating: 5,
  },
  {
    name: 'Sarah Chen',
    role: 'Data Scientist @ Netflix',
    company: 'Netflix',
    text: 'The resume analyzer showed me exactly what I was missing. After fixing it, I got 5 referral responses in one week.',
    rating: 5,
  },
];

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const numericTarget = parseInt(target.replace(/[^0-9]/g, ''));

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 2000;
        const step = Math.ceil(numericTarget / (duration / 16));
        const timer = setInterval(() => {
          start += step;
          if (start >= numericTarget) { setCount(numericTarget); clearInterval(timer); }
          else setCount(start);
        }, 16);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericTarget]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{target.includes('+') ? '+' : ''}{target.includes('%') ? '%' : ''}
    </span>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#040408] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'glass border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center">
              <span className="font-display font-bold text-[#00FF87] text-sm">R</span>
            </div>
            <span className="font-display font-bold text-xl">ReferX</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Testimonials'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-white/50 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={() => navigate('/auth')} className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Sign in
            </button>
            <button onClick={() => navigate('/auth?tab=signup')} className="btn-primary text-sm py-2 px-5">
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient min-h-screen flex items-center pt-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF87]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00b4d8]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Floating cards */}
        <div className="absolute top-32 right-12 hidden xl:block animate-float" style={{ animationDelay: '0s' }}>
          <div className="glass rounded-2xl p-4 w-56 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#00FF87]/20 flex items-center justify-center text-xs font-bold text-[#00FF87]">PK</div>
              <div>
                <p className="text-xs font-semibold">Priya K.</p>
                <p className="text-[10px] text-white/40">Senior SWE @ Google</p>
              </div>
            </div>
            <div className="bg-[#00FF87]/10 rounded-lg p-2 text-xs text-[#00FF87] font-medium">✓ Referred 3 students this month</div>
          </div>
        </div>

        <div className="absolute bottom-40 left-12 hidden xl:block animate-float" style={{ animationDelay: '2s' }}>
          <div className="glass rounded-2xl p-4 w-52">
            <p className="text-xs text-white/40 mb-1">Referral accepted</p>
            <p className="text-sm font-semibold mb-2">Software Engineer @ Meta</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-3/4 progress-bar" />
              </div>
              <span className="text-[10px] text-[#00FF87]">75%</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-[#00FF87]/20">
            <Sparkles size={14} className="text-[#00FF87]" />
            <span className="text-sm text-[#00FF87] font-medium">India's #1 Alumni Referral Network</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-6xl md:text-8xl leading-none tracking-tight mb-6 max-w-5xl mx-auto">
            Land your{' '}
            <span className="gradient-text">dream job</span>
            {' '}through{' '}
            <span className="gradient-text">alumni referrals</span>
          </h1>

          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Skip the ATS black hole. Connect with verified alumni at top companies who can refer you internally — 
            turning your application from <em className="text-white/70">ignored</em> to <em className="text-[#00FF87]">shortlisted</em>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={() => navigate('/auth?tab=signup&role=student')}
              className="btn-primary text-base py-3.5 px-8 flex items-center gap-2 rounded-2xl shadow-lg shadow-[#00FF87]/10">
              I'm a Student <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/auth?tab=signup&role=alumni')}
              className="btn-ghost text-base py-3.5 px-8 rounded-2xl flex items-center gap-2">
              I'm an Alumni <Users size={18} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display font-bold text-3xl text-white mb-1">
                  <AnimatedCounter target={value} />
                </div>
                <div className="text-sm text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={20} className="text-white/20" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border border-white/10">
              <span className="text-sm text-white/50">Everything you need</span>
            </div>
            <h2 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Built for <span className="gradient-text">your success</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              From profile building to referral tracking — every tool designed to get you hired faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, accent }) => (
              <div key={title}
                className="glass glass-hover rounded-2xl p-6 group cursor-default transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5`}>
                  <Icon size={22} style={{ color: accent }} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FF87]/2 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-5xl md:text-6xl mb-6">
              How <span className="gradient-text">ReferX works</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">Four simple steps to go from student to hired.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
                )}
                <div className="glass rounded-2xl p-6 relative z-10 h-full">
                  <div className="font-mono text-4xl font-bold text-[#00FF87]/20 mb-4">{step}</div>
                  <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Real stories,{' '}
              <span className="gradient-text">real results</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, rating }) => (
              <div key={name} className="glass glass-hover rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array(rating).fill(0).map((_, i) => (
                    <Star key={i} size={14} className="text-[#00FF87] fill-[#00FF87]" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF87]/20 to-[#00b4d8]/20 flex items-center justify-center text-sm font-bold text-[#00FF87]">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-white/40">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass rounded-3xl p-12 md:p-16 relative overflow-hidden border border-[#00FF87]/10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF87]/5 to-[#00b4d8]/5" />
            <div className="relative">
              <h2 className="font-display font-bold text-5xl md:text-6xl mb-6 leading-tight">
                Your dream job is one<br />
                <span className="gradient-text">referral away</span>
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
                Join 12,400+ students who've landed internships and jobs through alumni referrals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/auth?tab=signup')} className="btn-primary text-base py-4 px-10 rounded-2xl flex items-center justify-center gap-2">
                  Start for free <ArrowRight size={18} />
                </button>
                <button onClick={() => navigate('/auth')} className="btn-ghost text-base py-4 px-10 rounded-2xl">
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center">
              <span className="font-display font-bold text-[#00FF87] text-xs">R</span>
            </div>
            <span className="font-display font-semibold">ReferX</span>
          </div>
          <p className="text-white/20 text-sm">© 2024 ReferX. Built for students, by students.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <a key={link} href="#" className="text-sm text-white/30 hover:text-white transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
