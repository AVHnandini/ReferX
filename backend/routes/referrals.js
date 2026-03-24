import express from 'express';
import { requestReferral, respondToReferral, scheduleInterview, getReferralStatus, getStudentReferrals, getAlumniReferrals, cancelReferral, getAllReferrals, sendInterviewReminders } from '../controllers/referralController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
const router = express.Router();

router.post('/request', authenticate, requireRole('student'), requestReferral);
router.put('/respond/:id', authenticate, requireRole('alumni'), respondToReferral);
router.put('/schedule/:id', authenticate, requireRole('alumni'), scheduleInterview);
router.put('/cancel/:id', authenticate, requireRole('student'), cancelReferral);
router.get('/status', authenticate, getReferralStatus);
router.get('/student', authenticate, requireRole('student'), getStudentReferrals);
router.get('/alumni', authenticate, requireRole('alumni'), getAlumniReferrals);
router.get('/reminders', authenticate, sendInterviewReminders);
router.get('/all', authenticate, requireRole('admin'), getAllReferrals);

export default router;
