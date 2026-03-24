import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ userId: req.user.id, _id: req.params.id }, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
