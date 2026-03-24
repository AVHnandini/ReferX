import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/10 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-brand-400 transition-all"
      />
    </div>
  );
}
