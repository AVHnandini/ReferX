import React from 'react';
import { motion } from 'framer-motion';

export default function ProfileStrength({ score = 60, referrals = 8, successRate = 70 }) {
  const normalized = Math.min(100, Math.max(0, score));
  const strokeDashoffset = 283 - (283 * normalized) / 100;

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-white text-lg font-bold mb-4">Profile Strength</h3>
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.12)" strokeWidth="10" fill="none" />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#grad)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="283"
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2 }}
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{normalized}%</span>
            <span className="text-xs text-gray-300">complete</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <p className="text-xs text-white/60">Referrals</p>
              <p className="text-xl font-bold text-white">{referrals}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <p className="text-xs text-white/60">Success</p>
              <p className="text-xl font-bold text-white">{successRate}%</p>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-4">
            Complete your profile by adding more skills, internship details, and a resume to increase your match scores.
          </p>
        </div>
      </div>
    </div>
  );
}
