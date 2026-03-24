import React from 'react';
import { motion } from 'framer-motion';

export default function ProfileStrength({ score = 0 }) {
  const gradient = score > 75 ? 'from-accent-lime to-brand-400' : score > 50 ? 'from-accent-cyan to-brand-400' : 'from-brand-400 to-accent-cyan';
  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-white/10" />
          <motion.div initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - score }}
            className="absolute inset-0" style={{}}
          >
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              <path className="text-white/10" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831" />
              <path className="text-brand-400" stroke="url(#gradient)" strokeWidth="3" fill="none" strokeDasharray="100" strokeDashoffset={100-score} d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-semibold text-sm text-white">{score}%</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white">Profile Strength</h3>
          <p className="text-xs text-white/50">Complete your profile to get more relevant referrals and matches.</p>
        </div>
      </div>
    </div>
  );
}
