import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, text } = req.body;
    const message = new Message({ sender: req.user.id, receiver: receiver_id, text });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const myId = req.user.id;
    const messages = await Message.find({ $or: [{ sender: myId }, { receiver: myId }] })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const otherId = msg.sender._id.toString() === myId ? msg.receiver._id.toString() : msg.sender._id.toString();
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({ ...msg.toObject(), other_user: msg.sender._id.toString() === myId ? msg.receiver : msg.sender });
      }
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
