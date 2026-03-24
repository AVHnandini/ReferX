import React from 'react';
import { User, Briefcase, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AlumniCard({ alumni, onRequest, onMessage }) {
  return (
    <div className="card p-4 transition-all hover:-translate-y-1 hover:shadow-xl border border-white/10 bg-white/5">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-white font-bold text-lg">
          {alumni.name?.[0] || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white truncate">{alumni.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 text-white/70">{alumni.experience || '0'} yrs</span>
          </div>
          <p className="text-xs text-white/60 truncate">{alumni.role} @ {alumni.company}</p>
          <p className="text-xs text-white/40 line-clamp-2 mt-2">{alumni.bio || 'No bio provided yet.'}</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {(alumni.skills || []).slice(0, 5).map(skill => (
              <span key={skill} className="text-[11px] px-2 py-0.5 rounded-lg bg-white/10 text-white/70">{skill}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onRequest(alumni)} className="btn-primary flex-1">Request Referral</button>
        <button onClick={() => onMessage(alumni)} className="btn-secondary flex-1">Message</button>
      </div>
      <Link to={`/student/alumni/${alumni.id}`} className="mt-3 inline-flex items-center text-xs text-brand-300 hover:text-brand-200 gap-1">
        <User size={12} /> View profile
      </Link>
    </div>
  );
}
