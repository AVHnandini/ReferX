import React from 'react';
import { clsx } from 'clsx';

export function Avatar({ src, name, size = 'md', className }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '?';
  
  if (src) return (
    <img src={src} alt={name} className={clsx('rounded-full object-cover', sizes[size], className)} />
  );
  
  return (
    <div className={clsx('rounded-full bg-gradient-to-br from-[#00FF87]/20 to-[#00b4d8]/20 border border-white/10 flex items-center justify-center font-semibold text-[#00FF87]', sizes[size], className)}>
      {initials}
    </div>
  );
}

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-white/10 text-white/70',
    green: 'bg-emerald-500/15 text-emerald-400',
    yellow: 'bg-amber-500/15 text-amber-400',
    red: 'bg-red-500/15 text-red-400',
    blue: 'bg-blue-500/15 text-blue-400',
    purple: 'bg-purple-500/15 text-purple-400',
    accent: 'bg-[#00FF87]/15 text-[#00FF87]',
  };
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, max = 100, color = 'accent', className }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={clsx('w-full h-1.5 bg-white/5 rounded-full overflow-hidden', className)}>
      <div className="h-full progress-bar transition-all duration-1000" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={clsx('skeleton rounded-lg', className)} />;
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-white/20" />
        </div>
      )}
      <h3 className="font-display font-semibold text-white/60 mb-2">{title}</h3>
      {description && <p className="text-sm text-white/30 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', variant: 'yellow' },
    accepted: { label: 'Accepted', variant: 'green' },
    rejected: { label: 'Rejected', variant: 'red' },
    referred: { label: 'Referred ✓', variant: 'accent' },
    approved: { label: 'Approved', variant: 'green' },
    'not_required': { label: 'Verified', variant: 'green' },
  };
  const s = map[status] || { label: status, variant: 'default' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative glass rounded-2xl w-full shadow-2xl', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="font-display font-bold text-lg">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
              ✕
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm text-white/60 font-medium">{label}</label>}
      <input className={clsx('input-field', error && 'border-red-500/50', className)} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm text-white/60 font-medium">{label}</label>}
      <textarea className={clsx('input-field resize-none', error && 'border-red-500/50', className)} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm text-white/60 font-medium">{label}</label>}
      <select className={clsx('input-field', error && 'border-red-500/50', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={clsx('border-2 border-white/10 border-t-[#00FF87] rounded-full animate-spin', sizes[size])} />
  );
}
