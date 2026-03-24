import React, { useState, useEffect } from 'react';

export default function ReferralModal({ visible, onClose, alumni, job, onSubmit }) {
  const [message, setMessage] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [suggested, setSuggested] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setMessage(`Hi ${alumni?.name},\n\nI am interested in the ${job?.title} role at ${job?.company}. I have ${job?.required_skills?.slice(0,3).join(', ')} experience and would appreciate your referral.`);
    setSuggested(false);
  }, [visible, alumni, job]);

  if (!visible) return null;

  const handleSuggest = () => {
    setAiMessage(`Hello ${alumni?.name}, I'm excited about the ${job?.title} role at ${job?.company}. I've demonstrated relevant skills like ${job?.required_skills?.slice(0,3).join(', ')} and would love your endorsement. Thank you for your time!`);
    setSuggested(true);
  };

  const handleSubmit = () => {
    onSubmit({ message: suggested ? aiMessage || message : message });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0d0d16] border border-white/10 rounded-2xl p-6 relative">
        <h3 className="text-lg font-semibold mb-2">Request Referral from {alumni?.name}</h3>
        <p className="text-xs text-white/40 mb-4">Job: {job?.title} at {job?.company}</p>
        <textarea value={suggested ? aiMessage : message} onChange={e => setMessage(e.target.value)} rows={6}
          className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
        <div className="flex items-center justify-between gap-2 mt-4">
          <button onClick={handleSuggest} className="btn-secondary">AI Suggested Message</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary">Send Request</button>
          </div>
        </div>
      </div>
    </div>
  );
}
