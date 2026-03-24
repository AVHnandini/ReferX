import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Lightbulb } from 'lucide-react';

export default function ReferralFeedback({ feedback, status }) {
  if (status !== 'rejected' || !feedback) return null;

  const suggestions = feedback.split('. ').filter(s => s.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
    >
      <div className="flex gap-3">
        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-300 mb-3">Feedback from Alumni</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex gap-3 text-sm text-gray-300">
                <Lightbulb size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <p>{suggestion}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            💡 Use this feedback to improve your profile and increase chances for future referrals
          </p>
        </div>
      </div>
    </motion.div>
  );
}