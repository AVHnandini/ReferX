import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
    company: { type: String, default: '' },
    jobRole: { type: String, default: '' },
    experience: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    skills: { type: [String], default: [] },
    resume: { type: String, default: '' },
    profileScore: { type: Number, default: 0 },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
