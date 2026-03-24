import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'referred'], default: 'pending' },
    message: { type: String, default: '' },
    resume: { type: String, default: '' },
    feedback: { type: String, default: '' },
    chatEnabled: { type: Boolean, default: false },
    requestedVia: { type: String, enum: ['job', 'direct'], default: 'job' },
    interviewLink: { type: String, default: '' },
    interviewDate: { type: Date, default: null },
    interviewReminder: { type: Boolean, default: false },
    responseMessage: { type: String, default: '' },
  },
  { timestamps: true },
);

const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);
export default Referral;
