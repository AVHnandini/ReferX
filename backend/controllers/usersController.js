const supabase = require('../config/supabase');

function calcProfileScore(user) {
  let score = 0;
  if (user.name) score += 15;
  if (user.bio) score += 15;
  if (user.avatar_url) score += 10;
  if (user.skills && user.skills.length > 0) score += 20;
  if (user.resume_url) score += 20;
  if (user.linkedin_url) score += 10;
  if (user.company) score += 10;
  return Math.min(score, 100);
}

exports.getProfile = async (req, res) => {
  try {
    const { password: _, otp_code: __, ...user } = req.user;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role;
    delete updates.id;

    const score = calcProfileScore({ ...req.user, ...updates });
    updates.profile_score = score;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users').update(updates).eq('id', req.user.id).select().single();
    if (error) throw error;

    const { password: _, ...safeUser } = data;

    // Award points for profile completion
    if (score >= 80 && req.user.profile_score < 80) {
      await supabase.from('users').update({ points: (req.user.points || 0) + 50 }).eq('id', req.user.id);
    }

    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = supabase.from('users').select('id, name, email, role, company, job_role, verification_status, profile_score, points, created_at');
    if (role) query = query.eq('role', role);
    if (status) query = query.eq('verification_status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users').select('id, name, email, role, company, job_role, years_experience, linkedin_url, skills, bio, avatar_url, resume_url, profile_score, points, verification_status, created_at')
      .eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'User not found' });
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAlumni = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, company, job_role, years_experience, linkedin_url, skills, bio, avatar_url, profile_score')
      .eq('role', 'alumni')
      .eq('verification_status', 'approved');
    if (error) throw error;
    res.json({ alumni: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role, company, points, avatar_url')
      .order('points', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ leaderboard: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
