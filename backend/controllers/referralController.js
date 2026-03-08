import { supabase } from '../config/supabase.js';

export const requestReferral = async (req, res) => {
  try {
    const { alumni_id, job_id, message } = req.body;
    
    // Check alumni is approved
    const { data: alumni } = await supabase.from('users').select('verification_status').eq('id', alumni_id).single();
    if (alumni?.verification_status !== 'approved') {
      return res.status(400).json({ error: 'Alumni not yet verified.' });
    }

    const { data, error } = await supabase
      .from('referrals')
      .insert({ student_id: req.user.id, alumni_id, job_id, message, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const respondToReferral = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body; // accepted, rejected, referred

    const { data, error } = await supabase
      .from('referrals')
      .update({ status, feedback, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('alumni_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReferralStatus = async (req, res) => {
  try {
    const { role, id } = req.user;
    const field = role === 'student' ? 'student_id' : 'alumni_id';
    
    const { data, error } = await supabase
      .from('referrals')
      .select('*, jobs(*), student:users!referrals_student_id_fkey(id,name,email,skills,resume,profile_score), alumni:users!referrals_alumni_id_fkey(id,name,email,company,job_role)')
      .eq(field, id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllReferrals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*, jobs(title,company), student:users!referrals_student_id_fkey(name,email), alumni:users!referrals_alumni_id_fkey(name,email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
