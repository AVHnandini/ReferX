import { supabase } from '../config/supabase.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, text } = req.body;
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: req.user.id, receiver_id, text })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const myId = req.user.id;
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(id,name,email), receiver:users!messages_receiver_id_fkey(id,name,email)')
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Get unique conversations
    const seen = new Set();
    const conversations = [];
    for (const msg of data || []) {
      const otherId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({ ...msg, other_user: msg.sender_id === myId ? msg.receiver : msg.sender });
      }
    }
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
