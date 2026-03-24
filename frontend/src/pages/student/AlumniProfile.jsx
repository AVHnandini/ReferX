import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService, jobService, referralService } from '../../services/api';
import { MessageSquare, GitBranch, ArrowLeft } from 'lucide-react';

export default function AlumniProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [refSuccess, setRefSuccess] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([userService.getAllUsers(), jobService.getAllJobs(), referralService.getStatus()])
      .then(([users, jobs, referrals]) => {
        const user = users.data.find((u) => u.id.toString() === id.toString());
        setAlumni(user);
        setPostedJobs(jobs.data.filter((j) => j.posted_by === user?.id));
        setRefSuccess(referrals.data.filter((r) => r.alumni_id === user?.id && r.status === 'referred').length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !alumni) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">Loading...</div>;
  }

  const successCount = alumni.referrals?.filter(x => x.status === 'accepted').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold">{alumni.name?.[0]?.toUpperCase()}</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{alumni.name}</h2>
              <p className="text-sm text-gray-300">{alumni.role} at {alumni.company}</p>
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-4">{alumni.bio || 'Experienced professional helping students land their next role.'}</p>
          <div className="space-y-2 text-sm text-gray-300">
            <p><b>Experience:</b> {alumni.experience || 0} years</p>
            <p><b>Skills:</b> {(alumni.skills || []).join(', ') || 'N/A'}</p>
            <p><b>Referral success:</b> {successCount}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button onClick={() => navigate('/student/referrals')} className="py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white">Request Referral</button>
            <button onClick={() => navigate('/student/chat')} className="py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2"><MessageSquare size={14}/>Message</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 xl:col-span-2">
          <h3 className="text-white font-bold text-xl mb-4">Posted Jobs</h3>
          {postedJobs.length === 0 ? (
            <p className="text-gray-300">No jobs posted yet.</p>
          ) : (
            <div className="space-y-3">
              {postedJobs.map(job => (
                <div key={job.id} className="glass rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.company} • {job.location}</p>
                  </div>
                  <a href={`/student/jobs`} className="text-xs text-[#00FF87] hover:underline">View Listing</a>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
