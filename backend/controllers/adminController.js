import { supabase } from '../config/supabase.js';

export const getPendingAlumni = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, company, job_role, experience, linkedin, verification_status, created_at')
      .eq('role', 'alumni')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // approved or rejected
    const { data, error } = await supabase
      .from('users')
      .update({ verification_status: status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    await supabase.from('alumni_verifications').upsert({
      alumni_id: id,
      status,
      reviewed_by: req.user.id,
      reviewed_at: new Date().toISOString()
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [students, alumni, referrals, jobs, pending] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'student'),
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'alumni'),
      supabase.from('referrals').select('id, status', { count: 'exact' }),
      supabase.from('jobs').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'alumni').eq('verification_status', 'pending'),
    ]);

    const referralData = referrals.data || [];
    const statusCounts = referralData.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total_students: students.count || 0,
      total_alumni: alumni.count || 0,
      total_referrals: referrals.count || 0,
      active_jobs: jobs.count || 0,
      pending_alumni: pending.count || 0,
      referral_breakdown: statusCounts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
