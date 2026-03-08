import express from 'express';
import { analyzeResume } from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
router.post('/analyze', authenticate, analyzeResume);
export default router;
