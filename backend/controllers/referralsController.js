const supabase = require('../config/supabase');

exports.requestReferral = async (req, res) => {
  try {
    const { jobId, alumniId, message } = req.body;

    // Check if already requested
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('student_id', req.user.id)
      .eq('job_id', jobId)
      .single();

    if (existing) return res.status(400).json({ error: 'You already requested a referral for this job' });

    const { data, error } = await supabase.from('referrals').insert({
      student_id: req.user.id,
      alumni_id: alumniId,
      job_id: jobId,
      message: message || '',
      status: 'pending',
    }).select('*, job:jobs(*), alumni:users!alumni_id(id, name, company, avatar_url)').single();

    if (error) throw error;

    // Create notification for alumni
    await Notification.create({
      userId: alumni_id,
      title: 'New Referral Request',
      message: `${req.user.name} requested a referral for ${job.title} at ${job.company}`,
    });

    // Award points for requesting referral
    await supabase.from('users').update({ points: (req.user.points || 0) + 10 }).eq('id', req.user.id);

    res.status(201).json({ referral: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.respondToReferral = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const validStatuses = ['accepted', 'rejected', 'referred'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const { data, error } = await supabase
      .from('referrals')
      .update({ status, alumni_feedback: feedback, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('alumni_id', req.user.id)
      .select('*, student:users!student_id(id, name), job:jobs(title)')
      .single();

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: data.student.id,
      type: `referral_${status}`,
      title: `Referral ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your referral request for ${data.job?.title} was ${status}`,
      data: { referralId: data.id },
    });

    res.json({ referral: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentReferrals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*, job:jobs(*), alumni:users!alumni_id(id, name, company, avatar_url, job_role)')
      .eq('student_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ referrals: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAlumniReferrals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*, job:jobs(*), student:users!student_id(id, name, email, skills, resume_url, avatar_url, bio, profile_score)')
      .eq('alumni_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ referrals: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllReferrals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*, job:jobs(title, company), student:users!student_id(name), alumni:users!alumni_id(name, company)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ referrals: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
