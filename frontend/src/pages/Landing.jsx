import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Zap, Users, GitBranch, Shield, Star, ChevronDown, Sparkles, TrendingUp, MessageSquare } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Instant Referrals', desc: 'Connect with alumni at top companies and get referred within days, not months.', color: 'from-brand-500 to-brand-700' },
  { icon: Users, title: 'Alumni Network', desc: 'Access thousands of verified alumni professionals across Fortune 500 companies.', color: 'from-accent-cyan to-brand-500' },
  { icon: Shield, title: 'Verified Profiles', desc: 'Every alumni profile is verified with company credentials for trusted connections.', color: 'from-accent-lime to-accent-cyan' },
  { icon: TrendingUp, title: 'Smart Matching', desc: 'AI-powered job matching based on your skills and career goals.', color: 'from-accent-amber to-accent-rose' },
  { icon: MessageSquare, title: 'Real-Time Chat', desc: 'Chat directly with alumni mentors for guidance and referral requests.', color: 'from-accent-rose to-brand-500' },
  { icon: GitBranch, title: 'Track Progress', desc: 'Monitor your referral status from request to successful placement.', color: 'from-brand-400 to-accent-lime' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'SWE at Google', school: 'IIT Bombay', text: 'ReferX helped me land my dream job at Google. The alumni network is incredibly responsive and supportive.', avatar: 'P' },
  { name: 'Arjun Mehta', role: 'PM at Meta', school: 'NIT Trichy', text: 'Got 3 referrals within a week of signing up. The platform makes it effortless to connect with the right alumni.', avatar: 'A' },
  { name: 'Sneha Reddy', role: 'Data Scientist at Netflix', school: 'BITS Pilani', text: 'The resume analyzer gave me actionable feedback. My profile strength went from 40% to 95% overnight!', avatar: 'S' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Profile', desc: 'Sign up with your college email, upload your resume, and add your skills.' },
  { step: '02', title: 'Browse Opportunities', desc: 'Explore job listings posted by alumni at top companies matching your skills.' },
  { step: '03', title: 'Request a Referral', desc: 'Send a referral request to an alumni at your target company with a personalized message.' },
  { step: '04', title: 'Get Referred', desc: 'Alumni reviews your profile and refers you internally. Track your status in real-time.' },
];

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 animate-float ${className}`} />
);

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingOrb className="w-[600px] h-[600px] bg-brand-600 -top-64 -left-32" />
        <FloatingOrb className="w-[400px] h-[400px] bg-accent-cyan top-1/2 -right-32" style={{ animationDelay: '2s' }} />
        <FloatingOrb className="w-[300px] h-[300px] bg-accent-rose bottom-32 left-1/3" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl">ReferX</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Stories</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-400 mb-8">
            <Sparkles size={14} /> Trusted by 10,000+ students across India
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-bold leading-none mb-6">
            Land your dream job
            <br />
            <span className="text-gradient">through referrals.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect with alumni working at top companies. Get referred, skip the queue, and start your career faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup?role=student" className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2 animate-glow">
              I'm a Student <ArrowRight size={16} />
            </Link>
            <Link to="/signup?role=alumni" className="btn-secondary text-base px-8 py-4 inline-flex items-center gap-2">
              I'm an Alumni <Users size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-20">
          {[['10K+', 'Students'], ['2K+', 'Alumni'], ['85%', 'Placement Rate']].map(([num, label]) => (
            <div key={label} className="glass rounded-2xl p-6 text-center">
              <div className="font-display text-3xl font-bold text-gradient">{num}</div>
              <div className="text-sm text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-4">Everything you need to succeed</h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">A complete platform built for modern job seekers who value connections over cold applications.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-default">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-4">How ReferX Works</h2>
          <p className="text-gray-400 text-center mb-16">Four simple steps to your dream job</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((h, i) => (
            <motion.div key={h.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="relative">
              <div className="font-display text-7xl font-bold text-brand-500/10 mb-4">{h.step}</div>
              <h3 className="font-display font-bold text-lg mb-2">{h.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{h.desc}</p>
              {i < 3 && <div className="hidden lg:block absolute top-8 right-0 w-full h-px bg-gradient-to-r from-brand-500/30 to-transparent" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-4">Success Stories</h2>
          <p className="text-gray-400 text-center mb-16">Hear from students who landed their dream jobs</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-accent-amber fill-accent-amber" />)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role} · {t.school}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-24 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="glass rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-accent-cyan/10 rounded-3xl" />
          <div className="relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Ready to get referred?</h2>
            <p className="text-gray-400 mb-8 text-lg">Join thousands of students who've already landed their dream jobs through ReferX.</p>
            <Link to="/signup" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
              Start for Free <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap size={14} className="text-brand-400" />
          <span className="font-display font-bold text-white">ReferX</span>
        </div>
        <p>© 2025 ReferX. Built for students who dream big.</p>
      </footer>
    </div>
  );
}
