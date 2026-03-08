import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Search } from 'lucide-react';
import { chatService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    Promise.all([chatService.getConversations(), userService.getAllUsers()])
      .then(([c, u]) => {
        setConversations(c.data);
        const others = u.data.filter(x => x.id !== user?.id);
        setAllUsers(others);
      });
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      chatService.getMessages(selectedUser.id)
        .then(r => setMessages(r.data))
        .finally(() => setLoading(false));
    }
  }, [selectedUser]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;
    const newMsg = { id: Date.now(), sender_id: user.id, receiver_id: selectedUser.id, text, created_at: new Date().toISOString() };
    setMessages(p => [...p, newMsg]);
    setText('');
    try { await chatService.send({ receiver_id: selectedUser.id, text }); } catch {}
  };

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-display font-bold mb-3">Messages</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-sm py-2" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {filteredUsers.map(u => (
            <button key={u.id} onClick={() => setSelectedUser(u)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                ${selectedUser?.id === u.id ? 'bg-brand-600/20 border border-brand-500/30' : 'hover:bg-white/5'}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {u.name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                <p className="text-xs text-gray-500 capitalize">{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold">
                {selectedUser.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-white">{selectedUser.name}</p>
                <p className="text-xs text-gray-400 capitalize">{selectedUser.role}{selectedUser.company ? ` · ${selectedUser.company}` : ''}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">Start a conversation!</p>
                </div>
              ) : messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-brand-600 text-white rounded-br-sm' : 'glass text-gray-200 rounded-bl-sm'}`}>
                      {msg.text}
                      <div className={`text-xs mt-1 opacity-60 ${isMe ? 'text-right' : ''}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEnd} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-white/5 flex gap-3">
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..."
                className="input flex-1" />
              <button type="submit" disabled={!text.trim()}
                className="btn-primary px-4 py-3 flex items-center gap-2 disabled:opacity-50">
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <h3 className="font-semibold text-lg mb-1">Select a conversation</h3>
            <p className="text-sm">Choose a user from the left to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
