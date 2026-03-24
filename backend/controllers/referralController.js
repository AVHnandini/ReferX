import Referral from '../models/Referral.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';

export const requestReferral = async (req, res) => {
  try {
    const { alumni_id, job_id, message } = req.body;

    // Check for existing referral
    const existing = await Referral.findOne({
      studentId: req.user.id,
      alumniId: alumni_id,
      jobId: job_id,
      status: { $in: ['pending', 'accepted'] }
    });
    if (existing) {
      return res.status(400).json({ error: 'Referral request already exists for this job and alumni.' });
    }

    const alumni = await User.findById(alumni_id);
    if (!alumni || alumni.verificationStatus !== 'approved') {
      return res.status(400).json({ error: 'Alumni not yet verified.' });
    }

    const job = await Job.findById(job_id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });

    const referral = new Referral({ studentId: req.user.id, alumniId: alumni_id, jobId: job_id, message, status: 'pending' });
    await referral.save();

    // Create notification for alumni
    await Notification.create({
      userId: alumni_id,
      title: 'New Referral Request',
      message: `${req.user.name} requested a referral for ${job.title} at ${job.company}`,
    });

    res.json(referral);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const respondToReferral = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const referral = await Referral.findOneAndUpdate(
      { _id: req.params.id, alumniId: req.user.id },
      { status, feedback },
      { new: true },
    ).populate('studentId', 'name').populate('jobId', 'title company');

    if (!referral) return res.status(404).json({ error: 'Referral not found.' });

    // Create notification for student
    const statusMessages = {
      accepted: 'accepted your referral request',
      rejected: 'declined your referral request',
      referred: 'successfully referred you'
    };

    await Notification.create({
      userId: referral.studentId._id,
      title: 'Referral Request Update',
      message: `${req.user.name} ${statusMessages[status]} for ${referral.jobId.title} at ${referral.jobId.company}`,
    });

    res.json(referral);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReferralStatus = async (req, res) => {
  try {
    const { role, id } = req.user;
    const filter = role === 'student' ? { studentId: id } : { alumniId: id };

    const referrals = await Referral.find(filter)
      .populate('jobId', 'title company')
      .populate('studentId', 'name email skills resume profileScore')
      .populate('alumniId', 'name email company jobRole')
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudentReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ studentId: req.user.id })
      .populate('jobId', 'title company')
      .populate('alumniId', 'name email company jobRole')
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAlumniReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ alumniId: req.user.id })
      .populate('jobId', 'title company')
      .populate('studentId', 'name email skills resume profileScore')
      .sort({ createdAt: -1 });

    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelReferral = async (req, res) => {
  try {
    const referral = await Referral.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user.id, status: 'pending' },
      { status: 'cancelled' },
      { new: true },
    );

    if (!referral) return res.status(404).json({ error: 'Pending referral not found.' });

    res.json(referral);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({})
      .populate('jobId', 'title company')
      .populate('studentId', 'name email')
      .populate('alumniId', 'name email')
      .sort({ createdAt: -1 });
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
