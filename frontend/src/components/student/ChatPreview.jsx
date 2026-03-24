import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function ChatPreview({ conversations = [], unreadCount = 0, onSelect }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-semibold">Recent Chat</h4>
        <div className="text-xs text-gray-300">{unreadCount} unread</div>
      </div>
      <div className="space-y-2">
        {conversations.slice(0, 4).map((c) => (
          <button key={c.id} onClick={() => onSelect(c)} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">{c.name?.[0] || 'A'}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{c.name}</p>
                <p className="text-xs text-gray-400 truncate">{c.lastMessage}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{c.time}</span>
            </div>
          </button>
        ))}
        {conversations.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-3">No messages yet</div>
        )}
      </div>
      <button className="mt-3 w-full py-2 rounded-xl border border-white/10 text-sm text-white hover:bg-white/10 flex items-center justify-center gap-2">
        <MessageCircle size={14} /> Open Chat Center
      </button>
    </div>
  );
}
