import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GitBranch, TrendingUp, Award, Clock, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobService, referralService } from '../../services/api';
import StatsCard from '../../components/student/StatsCard';
import JobCard from '../../components/student/JobCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([jobService.getRecommended(), referralService.getStatus()])
      .then(([j, r]) => {
        setJobs(j.data.slice(0, 6));
        setReferrals(r.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const profileStrength = user?.profile_score || 45;
  const totalReferrals = referrals.length;
  const acceptedReferrals = referrals.filter(r => r.status === 'accepted').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (job) => {
    // Navigate to job details page
    console.log('View job details:', job);
  };

  const handleRequestReferral = (job) => {
    // Open referral request modal
    console.log('Request referral for:', job);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your job search today
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Referrals"
            value={totalReferrals}
            icon={GitBranch}
            color="blue"
            delay={0.1}
          />
          <StatsCard
            title="Accepted"
            value={acceptedReferrals}
            icon={Award}
            color="green"
            delay={0.2}
          />
          <StatsCard
            title="Pending"
            value={pendingReferrals}
            icon={Clock}
            color="yellow"
            delay={0.3}
          />
          <StatsCard
            title="Profile Strength"
            value={`${profileStrength}%`}
            icon={TrendingUp}
            color="purple"
            delay={0.4}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Jobs */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recommended Jobs</h2>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl glass text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
                  />
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No jobs found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredJobs.map((job, index) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewDetails={handleViewDetails}
                      onRequestReferral={handleRequestReferral}
                      delay={0.6 + index * 0.1}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Strength */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Profile Strength</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Completion</span>
                  <span className="text-sm font-bold text-white">{profileStrength}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${profileStrength}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  />
                </div>
              </div>

              {profileStrength < 100 && (
                <div className="space-y-2">
                  {!user?.skills?.length && (
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Add skills (+25pts)
                    </div>
                  )}
                  {!user?.resume && (
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Upload resume (+20pts)
                    </div>
                  )}
                  {!user?.college && (
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Add college info (+15pts)
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {referrals.slice(0, 5).map((ref, index) => (
                  <div key={ref.id} className="flex items-center gap-3 p-3 rounded-xl glass">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-xs font-bold text-white">
                      {ref.jobs?.company?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {ref.jobs?.title || 'Job Application'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{ref.jobs?.company}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        ref.status === 'accepted'
                          ? 'bg-green-500/10 text-green-400'
                          : ref.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {ref.status}
                    </span>
                  </div>
                ))}
                {referrals.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </motion.div>

            {/* Suggested Alumni */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Recommended Alumni</h3>
              <div className="space-y-2">
                {['Riya', 'Arjun', 'Deepa'].map((name) => (
                  <div key={name} className="flex items-center justify-between bg-white/5 p-2 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/40 flex items-center justify-center text-xs">{name[0]}</div>
                      <div>
                        <p className="text-sm text-white">{name}</p>
                        <p className="text-xs text-white/50">Full stack · XYZ Corp</p>
                      </div>
                    </div>
                    <span className="text-green-300 text-xs">88% match</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
