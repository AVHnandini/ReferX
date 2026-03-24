import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userService } from '../../services/api';
import AlumniCard from '../../components/student/AlumniCard';
import SearchBar from '../../components/student/SearchBar';
import { useNavigate } from 'react-router-dom';

export default function StudentAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    userService.getAllUsers().then(res => {
      const list = res.data.filter(u => u.role === 'alumni' && u.verification_status === 'approved');
      setAlumni(list);
      setFilteredAlumni(list);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFilteredAlumni(alumni.filter(a => {
      const matchText = [a.name, a.company, a.role, a.bio].join(' ').toLowerCase();
      const skillMatch = a.skills?.some(s => s.toLowerCase().includes(skills.toLowerCase()));
      return (
        (!q || matchText.includes(q)) &&
        (!company || a.company.toLowerCase().includes(company.toLowerCase())) &&
        (!skills || skillMatch) &&
        (!role || a.role.toLowerCase().includes(role.toLowerCase()))
      );
    }));
  }, [alumni, search, company, skills, role]);

  const viewProfile = (alumni) => {
    navigate(`/student/alumni/${alumni.id}`);
  };

  const messageAlumni = (alumni) => {
    navigate('/student/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto mb-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white mb-1">Alumni Discovery</h1>
          <p className="text-sm text-gray-300 mb-4">Find alumni by company, role, or skills and request referrals directly.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search name, role or company" />
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="glass rounded-xl border border-white/10 px-3 py-2 text-white" />
            <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills" className="glass rounded-xl border border-white/10 px-3 py-2 text-white" />
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Job Role" className="glass rounded-xl border border-white/10 px-3 py-2 text-white" />
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAlumni.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-gray-300">No alumni found. Try updating your filters.</div>
        ) : (
          filteredAlumni.map(a => (
            <AlumniCard key={a.id} alumni={a} onViewProfile={viewProfile} onRequestMessage={messageAlumni} />
          ))
        )}
      </div>
    </div>
  );
}
