import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, default: '' },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
    // Basic Info
    bio: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    // Professional Info
    company: { type: String, default: '' },
    jobRole: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    location: { type: String, default: '' },
    // Social Links
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    // Skills and Experience
    skills: { type: [String], default: [] },
    experiences: [experienceSchema],
    // Legacy fields (keeping for compatibility)
    experience: { type: String, default: '' },
    resume: { type: String, default: '' },
    profileScore: { type: Number, default: 0 },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    // Referral stats
    referralsGiven: { type: Number, default: 0 },
    referralSuccessRate: { type: Number, default: 0 },
    jobsPosted: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
