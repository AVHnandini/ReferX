import User from '../models/User.js';
import Referral from '../models/Referral.js';
import Job from '../models/Job.js';

export const getPendingAlumni = async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni' }).sort({ createdAt: -1 }).select('name email company jobRole experience linkedin verificationStatus createdAt');
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(id, { verificationStatus: status }, { new: true });
    if (!user) return res.status(404).json({ error: 'Alumni not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [students, alumni, referrals, jobs, pending] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      Referral.countDocuments(),
      Job.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'alumni', verificationStatus: 'pending' }),
    ]);

    const referralRecords = await Referral.find({}, 'status');
    const statusCounts = referralRecords.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total_students: students,
      total_alumni: alumni,
      total_referrals: referrals,
      active_jobs: jobs,
      pending_alumni: pending,
      referral_breakdown: statusCounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
