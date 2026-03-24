import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const aiTemplates = {
  job:
    "Hi [Alumni],\n\nI saw the opening for [Job Title] at [Company], and your experience there really stood out.",
  asking:
    'I would greatly appreciate your referral for this role because my skills in [Skills] closely match the job requirements.'
};

export default function ReferralModal({ open, onClose, onSubmit, target, isJob = true, message, setMessage }) {
  const suggested = useMemo(() => {
    if (!target) return '';
    const title = target.title || target.name || 'this role';
    const company = target.company || 'your company';
    const skills = (target.required_skills || target.skills || []).slice(0, 3).join(', ') || 'the core skills';

    return `Hi ${target.name || 'there'},\n\nI’m interested in ${title} at ${company}. My experience in ${skills} makes me a strong fit. Could you please refer me?`;
  }, [target]);

  if (!open) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Request Referral</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        {target && (
          <div className="mb-4 text-sm text-gray-300">
            <p>Role: <strong className="text-white">{target.title || target.role}</strong></p>
            <p>Company: <strong className="text-white">{target.company}</strong></p>
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Write a personal note to the alumni..."
          className="w-full rounded-xl border border-white/10 bg-transparent p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        />

        <div className="mt-3 flex items-center justify-between gap-2">
          <button onClick={() => setMessage(suggested)} className="text-xs rounded-xl px-3 py-2 bg-white/10 text-white hover:bg-white/20">
            Use AI Suggestion
          </button>
          <span className="text-xs text-gray-400">Auto-filled options available</span>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl py-2 bg-white/10 text-white hover:bg-white/20">Cancel</button>
          <button onClick={onSubmit} className="flex-1 rounded-xl py-2 bg-blue-600 text-white hover:bg-blue-500">Send Request</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
