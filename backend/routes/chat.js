import express from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
router.post('/send', authenticate, sendMessage);
router.get('/messages/:userId', authenticate, getMessages);
router.get('/conversations', authenticate, getConversations);
export default router;
