import express from 'express';
import { getPendingAlumni, verifyAlumni, getDashboardStats } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
const router = express.Router();
router.get('/alumni', authenticate, requireRole('admin'), getPendingAlumni);
router.put('/alumni/:id/verify', authenticate, requireRole('admin'), verifyAlumni);
router.get('/stats', authenticate, requireRole('admin'), getDashboardStats);
export default router;
