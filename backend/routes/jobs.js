import express from 'express';
import { createJob, getAllJobs, getRecommendedJobs, deleteJob } from '../controllers/jobController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
const router = express.Router();
router.post('/create', authenticate, requireRole('alumni', 'admin'), createJob);
router.get('/all', authenticate, getAllJobs);
router.get('/recommend', authenticate, requireRole('student'), getRecommendedJobs);
router.delete('/:id', authenticate, requireRole('alumni', 'admin'), deleteJob);
export default router;
