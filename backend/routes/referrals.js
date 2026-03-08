import express from 'express';
import { requestReferral, respondToReferral, getReferralStatus, getAllReferrals } from '../controllers/referralController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
const router = express.Router();
router.post('/request', authenticate, requireRole('student'), requestReferral);
router.put('/respond/:id', authenticate, requireRole('alumni'), respondToReferral);
router.get('/status', authenticate, getReferralStatus);
router.get('/all', authenticate, requireRole('admin'), getAllReferrals);
export default router;
