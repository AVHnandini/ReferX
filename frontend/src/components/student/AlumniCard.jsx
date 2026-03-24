import React from 'react';
import { MessageCircle, Award, UserCheck } from 'lucide-react';

export default function AlumniCard({ alumni, onViewProfile, onRequestMessage }) {
  return (
    <div className="glass rounded-2xl p-5 hover:-translate-y-1 transition-all duration-200 border border-white/10">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">{(alumni.name?.[0] || 'A').toUpperCase()}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold truncate">{alumni.name}</h3>
          <p className="text-sm text-gray-300 truncate">{alumni.role} at {alumni.company}</p>
          <p className="text-xs text-gray-400">{alumni.experience} yrs experience</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-300 line-clamp-2">{alumni.bio || 'Passionate mentor and recruiter focusing on career growth.'}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(alumni.skills || []).slice(0, 5).map(skill => (
          <span key={`${alumni.id}-${skill}`} className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-200">{skill}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => onViewProfile(alumni)} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm">View Profile</button>
        <button onClick={() => onRequestMessage(alumni)} className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-1">
          <MessageCircle size={14} /> Message
        </button>
      </div>
    </div>
  );
}
