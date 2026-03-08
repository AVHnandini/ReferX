import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#040408] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center">
            <span className="font-display text-2xl font-bold text-[#00FF87]">R</span>
          </div>
          <div className="absolute inset-0 rounded-2xl border border-[#00FF87]/30 animate-ping" />
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#00FF87]/50 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
