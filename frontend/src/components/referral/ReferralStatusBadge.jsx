import React from 'react';

const statusColors = {
  pending: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: '⏳'
  },
  accepted: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: '✓'
  },
  rejected: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: '✗'
  },
  referred: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: '★'
  }
};

export default function ReferralStatusBadge({ status }) {
  const styles = statusColors[status] || statusColors.pending;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${styles.bg} ${styles.border} ${styles.text}`}>
      <span>{styles.icon}</span>
      <span className="capitalize">{status}</span>
    </div>
  );
}