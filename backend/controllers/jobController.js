import Job from '../models/Job.js';
import User from '../models/User.js';

export const createJob = async (req, res) => {
  try {
    const { title, company, description, location, skillsRequired, required_skills, salary, applicationLink, application_link } = req.body;
    const job = new Job({
      title,
      company,
      description,
      location,
      skillsRequired: skillsRequired || required_skills || [],
      salary,
      applicationLink: applicationLink || application_link || "",
      postedBy: req.user.id,
    });
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).populate('postedBy', 'name company').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const jobs = await Job.find({ isActive: true }).populate('postedBy', 'name company');
    const userSkills = user.skills || [];

    const scored = jobs
      .map((job) => {
        const jobSkills = job.skillsRequired || [];
        const matches = userSkills.filter((s) => jobSkills.map((j) => j.toLowerCase()).includes(s.toLowerCase()));
        const matchPct = jobSkills.length > 0 ? Math.round((matches.length / jobSkills.length) * 100) : 0;
        return { ...job.toObject(), match_percentage: matchPct };
      })
      .sort((a, b) => b.match_percentage - a.match_percentage);

    res.json(scored);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json({ message: 'Job removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
