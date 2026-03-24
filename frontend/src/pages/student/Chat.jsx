import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, User, Bot, Search, MoreVertical } from 'lucide-react';
import { chatService } from '../../services/api';

export default function StudentChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load conversations
    chatService.getConversations()
      .then(r => {
        setConversations(r.data);
        if (r.data.length > 0) {
          setSelectedConversation(r.data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      chatService.getMessages(selectedConversation.id)
        .then(r => setMessages(r.data))
        .catch(console.error);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      content: newMessage,
      sender: 'student',
      timestamp: new Date().toISOString(),
      isMe: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      await chatService.sendMessage(selectedConversation.id, newMessage);
      // In a real app, you'd get the response and add it to messages
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-6rem)]">
            <div className="lg:col-span-1 glass rounded-2xl animate-pulse" />
            <div className="lg:col-span-3 glass rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-gray-400">
            Connect with alumni and get career advice
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Conversations</h2>
            </div>

            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start by requesting a referral</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedConversation?.id === conv.id
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conv.alumni?.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {conv.alumni?.name || 'Alumni'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {conv.alumni?.job_role || 'Professional'}
                        </p>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto mt-1" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 glass rounded-2xl flex flex-col"
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                      {selectedConversation.alumni?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {selectedConversation.alumni?.name || 'Alumni'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {selectedConversation.alumni?.job_role || 'Professional'} at {selectedConversation.alumni?.company || 'Company'}
                      </p>
                    </div>
                    <button className="ml-auto p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <MoreVertical size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                      <p className="text-sm">
                        Send a message to get career advice or discuss opportunities
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.isMe
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-200'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.isMe ? 'text-blue-200' : 'text-gray-400'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">
                    Choose a conversation from the sidebar to start chatting
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}