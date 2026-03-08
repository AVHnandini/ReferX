import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { chatAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, EmptyState, Skeleton } from '../components/ui';
import { Send, MessageSquare, Search } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchAlumni, setSearchAlumni] = useState('');
  const [alumni, setAlumni] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Setup socket
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('user_online', user.id);
    
    socketRef.current.on('receive_message', (data) => {
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    socketRef.current.on('online_users', (users) => setOnlineUsers(users));
    socketRef.current.on('user_typing', () => setTyping(true));
    socketRef.current.on('user_stopped_typing', () => setTyping(false));

    return () => socketRef.current?.disconnect();
  }, [user.id]);

  useEffect(() => {
    chatAPI.getConversations().then(d => setConversations(d.conversations || [])).finally(() => setLoading(false));
    if (user.role === 'student') {
      usersAPI.getAlumni().then(d => setAlumni(d.alumni || []));
    } else {
      usersAPI.getAllUsers && usersAPI.getAlumni().catch(() => {});
    }
  }, [user.role]);

  useEffect(() => {
    if (activeUser) {
      chatAPI.getMessages(activeUser.id).then(d => setMessages(d.messages || []));
    }
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeUser) return;
    setSending(true);
    
    const msgData = {
      id: Date.now().toString(),
      sender_id: user.id,
      receiver_id: activeUser.id,
      text: input.trim(),
      created_at: new Date().toISOString(),
      sender: { id: user.id, name: user.name, avatar_url: user.avatar_url },
    };

    setMessages(prev => [...prev, msgData]);
    setInput('');
    
    socketRef.current?.emit('send_message', { ...msgData, receiverId: activeUser.id });

    try {
      await chatAPI.send({ receiverId: activeUser.id, text: msgData.text });
    } catch (err) {}
    
    setSending(false);
  };

  const handleTyping = () => {
    socketRef.current?.emit('typing', { senderId: user.id, receiverId: activeUser?.id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { senderId: user.id, receiverId: activeUser?.id });
    }, 1500);
  };

  const startChat = (otherUser) => {
    setActiveUser(otherUser);
    if (!conversations.find(c => c.user.id === otherUser.id)) {
      setConversations(prev => [{ user: otherUser, lastMessage: '', lastAt: new Date().toISOString() }, ...prev]);
    }
  };

  const filteredAlumni = alumni.filter(a =>
    a.name?.toLowerCase().includes(searchAlumni.toLowerCase()) ||
    a.company?.toLowerCase().includes(searchAlumni.toLowerCase())
  );

  const getTimeStr = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-7rem)] flex gap-4 animate-fade-in -m-6">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col glass border-r border-white/5">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-display font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={searchAlumni} onChange={e => setSearchAlumni(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00FF87]/30 transition-all"
                placeholder="Search or start chat..." />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Conversations */}
            {!searchAlumni && (
              <>
                {loading ? (
                  <div className="p-3 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-white/20 text-xs">No conversations yet</div>
                ) : (
                  conversations.map(c => (
                    <button key={c.user.id} onClick={() => startChat(c.user)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left
                        ${activeUser?.id === c.user.id ? 'bg-[#00FF87]/5 border-r-2 border-[#00FF87]' : ''}`}>
                      <div className="relative">
                        <Avatar name={c.user.name} src={c.user.avatar_url} size="sm" />
                        {onlineUsers.includes(c.user.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00FF87] rounded-full border-2 border-[#0d0d16]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.user.name}</p>
                        <p className="text-xs text-white/30 truncate">{c.lastMessage || 'Start a conversation'}</p>
                      </div>
                      {c.unread && <div className="w-2 h-2 bg-[#00FF87] rounded-full flex-shrink-0" />}
                    </button>
                  ))
                )}
              </>
            )}

            {/* Search results */}
            {searchAlumni && (
              <div className="p-2">
                <p className="text-xs text-white/30 px-2 mb-2">Alumni</p>
                {filteredAlumni.slice(0, 10).map(a => (
                  <button key={a.id} onClick={() => { startChat(a); setSearchAlumni(''); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all text-left">
                    <Avatar name={a.name} src={a.avatar_url} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className="text-xs text-white/30 truncate">{a.job_role} @ {a.company}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeUser ? (
            <>
              {/* Chat header */}
              <div className="glass border-b border-white/5 px-6 py-4 flex items-center gap-3">
                <div className="relative">
                  <Avatar name={activeUser.name} src={activeUser.avatar_url} />
                  {onlineUsers.includes(activeUser.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00FF87] rounded-full border-2 border-[#0d0d16]" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{activeUser.name}</p>
                  <p className="text-xs text-white/40">
                    {typing ? (
                      <span className="text-[#00FF87]">typing...</span>
                    ) : (
                      onlineUsers.includes(activeUser.id) ? (
                        <span className="text-[#00FF87]">● Online</span>
                      ) : 'Offline'
                    )}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-white/20 text-sm mt-8">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    Start your conversation with {activeUser.name}
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === user.id;
                  const showAvatar = !isMe && (i === 0 || messages[i-1].sender_id !== msg.sender_id);
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && (
                        <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                          <Avatar name={msg.sender?.name} src={msg.sender?.avatar_url} size="sm" />
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                          ${isMe ? 'bg-[#00FF87] text-black rounded-tr-sm font-medium' : 'glass rounded-tl-sm text-white/80'}`}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-white/20 px-1">{getTimeStr(msg.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="flex gap-3">
                    <Avatar name={activeUser.name} src={activeUser.avatar_url} size="sm" />
                    <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                      {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="glass border-t border-white/5 p-4 flex gap-3">
                <input value={input} onChange={e => { setInput(e.target.value); handleTyping(); }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00FF87]/30 transition-all"
                  placeholder={`Message ${activeUser.name}...`} />
                <button type="submit" disabled={!input.trim() || sending}
                  className="w-12 h-12 rounded-xl bg-[#00FF87] text-black flex items-center justify-center hover:bg-[#00e67a] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={MessageSquare}
                title="Select a conversation"
                description="Choose someone from the left to start chatting" />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
