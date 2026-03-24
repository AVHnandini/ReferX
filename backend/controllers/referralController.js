import Referral from '../models/Referral.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';

// Generate AI feedback based on student profile
const generateAIFeedback = async (studentId, alumniId, jobId) => {
  try {
    const student = await User.findById(studentId).select('skills bio resume');
    const alumni = await User.findById(alumniId).select('skills');
    const job = jobId ? await Job.findById(jobId).select('skills required') : null;

    const suggestions = [];

    // Check skills mismatch
    if (job && student.skills && alumni.skills) {
      const jobSkillsArray = job.skills || [];
      const studentSkillsArray = student.skills || [];
      const missingSkills = jobSkillsArray.filter(skill => !studentSkillsArray.includes(skill)).slice(0, 2);
      
      if (missingSkills.length > 0) {
        suggestions.push(`Strengthen your skills in: ${missingSkills.join(', ')}`);
      }
    }

    // Check bio/resume quality
    if (!student.bio || student.bio.length < 50) {
      suggestions.push('Add a detailed bio to your profile to stand out');
    }

    if (!student.resume) {
      suggestions.push('Upload your resume to increase chances of future referrals');
    }

    // Check profile completeness
    if (!student.skills || student.skills.length === 0) {
      suggestions.push('Add your technical skills to your profile');
    }

    return suggestions.length > 0 
      ? suggestions.join('. ')
      : 'Focus on improving your overall profile quality and experience.';
  } catch (err) {
    return 'Keep improving your profile for better opportunities.';
  }
};

export const requestReferral = async (req, res) => {
  try {
    console.log('Referral API received body:', req.body);
    const { alumniId, jobId, message, resume, requestedVia } = req.body;

    // Validate alumni
    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.verificationStatus !== 'approved') {
      return res.status(400).json({ error: 'Alumni not yet verified.' });
    }

    // Check for existing referral (only for job-based requests)
    if (jobId) {
      const existing = await Referral.findOne({
        studentId: req.user.id,
        alumniId,
        jobId,
        status: { $in: ['pending', 'accepted'] }
      });
      if (existing) {
        return res.status(400).json({ error: 'Referral request already exists for this job and alumni.' });
      }

      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ error: 'Job not found.' });
    }

    const referral = new Referral({
      studentId: req.user.id,
      alumniId,
      jobId: jobId || null,
      message,
      resume: resume || '',
      chatEnabled: false,
      requestedVia: requestedVia || (jobId ? 'job' : 'direct'),
      status: 'pending'
    });

    await referral.save();

    // Create notification for alumni
    const jobInfo = jobId ? (await Job.findById(jobId)) : null;
    const notificationMessage = jobInfo
      ? `${req.user.name} requested a referral for ${jobInfo.title} at ${jobInfo.company}`
      : `${req.user.name} requested a direct referral`;

    await Notification.create({
      userId: alumniId,
      title: 'New Referral Request',
      message: notificationMessage,
    });

    res.json(referral);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const respondToReferral = async (req, res) => {
  try {
    const { status, feedback, responseMessage } = req.body;
    
    const referral = await Referral.findById(req.params.id);
    if (!referral || referral.alumniId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ error: 'Referral not found.' });
    }

    // Generate AI feedback for rejections
    let aiGeneratedFeedback = feedback;
    if (status === 'rejected' && !feedback) {
      aiGeneratedFeedback = await generateAIFeedback(referral.studentId, req.user.id, referral.jobId);
    }

    const updatedReferral = await Referral.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        chatEnabled: status === 'accepted',
        feedback: aiGeneratedFeedback,
        responseMessage: responseMessage || ''
      },
      { new: true }
    ).populate('studentId', 'name').populate('jobId', 'title company');

    // Create notification for student
    const statusMessages = {
      accepted: 'accepted your referral request',
      rejected: 'declined your referral request',
      referred: 'successfully referred you'
    };

    const jobInfo = updatedReferral.jobId ? `for ${updatedReferral.jobId.title} at ${updatedReferral.jobId.company}` : '';
    
    await Notification.create({
      userId: referral.studentId,
      title: 'Referral Request Update',
      message: `${req.user.name} ${statusMessages[status]} ${jobInfo}`,
    });

    res.json(updatedReferral);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { interviewLink, interviewDate } = req.body;
    
    const referral = await Referral.findById(req.params.id);
    if (!referral || referral.alumniId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ error: 'Referral not found.' });
    }

    if (referral.status !== 'accepted') {
      return res.status(400).json({ error: 'Can only schedule interview for accepted referrals.' });
    }

    const updated = await Referral.findByIdAndUpdate(
      req.params.id,
      { interviewLink, interviewDate, chatEnabled: true },
      { new: true }
    ).populate('studentId', 'name').populate('alumniId', 'name');

    // Notify student about interview scheduling
    await Notification.create({
      userId: referral.studentId,
      title: 'Interview Scheduled',
      message: `Interview scheduled on ${new Date(interviewDate).toLocaleDateString()}. Link: ${interviewLink}`,
    });

    res.json(updated);
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
      .populate('alumniId', 'name email company jobRole profilePhoto')
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
      .populate('studentId', 'name email skills resume profileScore profilePhoto')
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

export const sendInterviewReminders = async (req, res) => {
  try {
    // Find all referrals with scheduled interviews
    const referrals = await Referral.find({
      status: 'accepted',
      interviewDate: { $exists: true, $ne: null },
    }).populate('studentId', 'name _id').populate('alumniId', 'name _id');

    const now = new Date();
    const remindersSent = [];

    for (const referral of referrals) {
      // Check if interview is within next 24 hours and hasn't been reminded yet
      const interviewDate = new Date(referral.interviewDate);
      const timeDifference = interviewDate - now;
      const hoursUntilInterview = timeDifference / (1000 * 60 * 60);

      // Send reminder if between 20-24 hours away (to avoid duplicates)
      if (hoursUntilInterview > 20 && hoursUntilInterview <= 24) {
        // Check if we already sent a reminder (look for recent notification from referral)
        const existingReminder = await Notification.findOne({
          userId: referral.studentId._id,
          title: { $regex: 'Interview Reminder' },
          createdAt: { $gte: new Date(now.getTime() - 3 * 60 * 60 * 1000) }, // within last 3 hours
        });

        if (!existingReminder) {
          // Send reminder to student
          await Notification.create({
            userId: referral.studentId._id,
            title: 'Interview Reminder',
            message: `Your interview with ${referral.alumniId.name} is in ${Math.round(hoursUntilInterview)} hours on ${interviewDate.toLocaleString()}.`,
            type: 'interview_reminder',
          });

          // Send reminder to alumni
          await Notification.create({
            userId: referral.alumniId._id,
            title: 'Interview Reminder',
            message: `Your interview with ${referral.studentId.name} is in ${Math.round(hoursUntilInterview)} hours on ${interviewDate.toLocaleString()}.`,
            type: 'interview_reminder',
          });

          remindersSent.push({
            referralId: referral._id,
            student: referral.studentId.name,
            alumni: referral.alumniId.name,
            interviewDate: interviewDate.toISOString(),
          });
        }
      }
    }

    return res.json({
      success: true,
      remindersSent: remindersSent.length,
      details: remindersSent,
    });
  } catch (err) {
    console.error('Error sending interview reminders:', err);
    res.status(500).json({ error: 'Failed to send reminders: ' + err.message });
  }
};
