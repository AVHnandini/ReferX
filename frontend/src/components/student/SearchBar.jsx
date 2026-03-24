import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full max-w-lg">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
      />
    </div>
  );
}
