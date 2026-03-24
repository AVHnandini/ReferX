import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    skillsRequired: { type: [String], default: [] },
    salary: { type: String, default: '' },
    applicationLink: { type: String, default: '' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default Job;
