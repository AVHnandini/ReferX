import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Globe } from 'lucide-react';
import { userService, jobService, referralService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import AlumniCard from '../../components/ui/AlumniCard';
import SearchBar from '../../components/ui/SearchBar';
import JobFilters from '../../components/ui/JobFilters';
import ReferralModal from '../../components/ui/ReferralModal';
import ProfileStrength from '../../components/ui/ProfileStrength';

export default function StudentAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isReferralModalOpen, setReferralModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([userService.getAllUsers(), jobService.getAllJobs(), referralService.getStatus()])
      .then(([u, j, r]) => {
        setAlumni(u.data.filter(item => item.role === 'alumni'));
        setJobs(j.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeAlumni = alumni.filter(a => {
    const q = filter.toLowerCase();
    const matches =
      a.name?.toLowerCase().includes(q) ||
      a.company?.toLowerCase().includes(q) ||
      a.role?.toLowerCase().includes(q) ||
      (a.skills || []).join(' ').toLowerCase().includes(q);
    const companyMatch = companyFilter ? a.company === companyFilter : true;
    const skillMatch = skillFilter ? (a.skills || []).includes(skillFilter) : true;
    return matches && companyMatch && skillMatch;
  });

  const companies = Array.from(new Set(alumni.map(a => a.company).filter(Boolean)));
  const skills = Array.from(new Set(alumni.flatMap(a => a.skills || [])));

  const recommendations = alumni
    .sort((a, b) => (b.profile_score || 0) - (a.profile_score || 0))
    .slice(0, 6);

  const onReferralSubmit = async ({ message }) => {
    if (!selectedAlumni || !selectedJob) return;
    try {
      await referralService.request({ alumni_id: selectedAlumni.id, job_id: selectedJob.id, message });
      showToast('Referral request sent successfully', 'success');
      setReferralModalOpen(false);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to send request', 'error');
    }
  };

  const handleRequestReferral = (alumni) => {
    setSelectedAlumni(alumni);
    setSelectedJob(jobs[0] || null);
    setReferralModalOpen(true);
  };

  const handleMessage = (alumni) => {
    // redirect to chat with alumni
    window.location.href = `/chat?user=${alumni.id}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-brand-400" /><h1 className="font-display text-2xl font-bold">Alumni Discovery</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <SearchBar value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search alumni by name/company/skill" />
            <JobFilters
              companies={companies}
              skills={skills}
              selectedCompany={companyFilter}
              selectedSkill={skillFilter}
              onCompanyChange={(e) => setCompanyFilter(e.target.value)}
              onSkillChange={(e) => setSkillFilter(e.target.value)}
            />
            <div className="card p-3 bg-white/5 border border-white/10">
              <h3 className="text-sm font-semibold mb-2">Career Insights</h3>
              <p className="text-xs text-white/50">Trending skills:</p>
              <div className="flex flex-wrap gap-1 mt-2">{skills.slice(0, 6).map(s => <span key={s} className="text-[10px] px-2 py-1 bg-brand-500/10 rounded-lg">{s}</span>)}</div>
              <p className="text-xs text-white/50 mt-2">Top companies hiring: {companies.slice(0, 3).join(', ') || 'updating...'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ProfileStrength score={Math.round((Math.random()*35)+60)} />
            <div className="card p-4">
              <h3 className="font-semibold">Quick Actions</h3>
              <ul className="mt-2 space-y-2 text-xs text-white/70">
                <li>• Upload resume</li>
                <li>• Search jobs</li>
                <li>• Find mentors</li>
              </ul>
            </div>
            <div className="card p-4">
              <h3 className="font-semibold">Referral Success Rate</h3>
              <p className="text-3xl font-bold mt-2">{Math.min(100, Math.round(Math.random()*30 + 60))}%</p>
              <p className="text-xs text-white/50 mt-1">Based on your last 30 requests</p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="font-semibold">Suggested Alumni</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map(a => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card" >
                  <h3 className="font-semibold text-white">{a.name}</h3>
                  <p className="text-xs text-white/60">{a.role} @ {a.company}</p>
                  <div className="mt-2 flex gap-2">{(a.skills || []).slice(0, 2).map(skill => <span key={skill} className="text-[10px] px-2 py-1 rounded-full bg-white/10">{skill}</span>)}</div>
                </motion.div>
              ))}
            </div>
          </section>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-white/10 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAlumni.map(a => (
                <AlumniCard key={a.id} alumni={a} onRequest={handleRequestReferral} onMessage={handleMessage} />
              ))}
              {activeAlumni.length === 0 && <p className="text-sm text-white/40">No alumni match your search/filter.</p>}
            </div>
          )}
        </div>

        <aside className="hidden xl:block sticky top-24 h-fit space-y-4">
          <div className="card p-4"> <h3 className="font-semibold">Activity Timeline</h3><p className="text-xs text-white/50 mt-2">You viewed {alumni.length} alumni. Last new member joined 2h ago.</p></div>
          <div className="card p-4"> <h3 className="font-semibold">Saved Jobs</h3><p className="text-xs text-white/50 mt-2">No saved jobs yet.</p></div>
          <div className="card p-4"> <h3 className="font-semibold">Latest messages</h3><p className="text-xs text-white/50 mt-2">No new messages.</p></div>
        </aside>
      </div>

      <ReferralModal
        visible={isReferralModalOpen}
        alumni={selectedAlumni}
        job={selectedJob}
        onClose={() => setReferralModalOpen(false)}
        onSubmit={onReferralSubmit}
      />
    </div>
  );
}
