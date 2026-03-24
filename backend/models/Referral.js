import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'referred'], default: 'pending' },
    message: { type: String, default: '' },
    feedback: { type: String, default: '' },
  },
  { timestamps: true },
);

const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);
export default Referral;
