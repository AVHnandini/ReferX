import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;
    delete updates.id;

    let score = 10;
    if (updates.name) score += 10;
    if (updates.company) score += 10;
    if (updates.skills?.length > 0) score += 20;
    if (updates.resume) score += 25;
    if (updates.linkedin) score += 15;
    if (updates.experience) score += 10;
    updates.profileScore = Math.min(score, 100);

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('name email role company verificationStatus profileScore createdAt').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAlumni = async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni', verificationStatus: 'approved' }).select('name email company jobRole experience linkedin skills profileScore');
    res.json({ alumni });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
