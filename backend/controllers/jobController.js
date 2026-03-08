import { supabase } from '../config/supabase.js';

export const createJob = async (req, res) => {
  try {
    const { title, company, description, location, required_skills, salary, application_link } = req.body;
    const { data, error } = await supabase
      .from('jobs')
      .insert({ title, company, description, location, required_skills, salary, application_link, posted_by: req.user.id, is_active: true })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, users!jobs_posted_by_fkey(name, company)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRecommendedJobs = async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('skills').eq('id', req.user.id).single();
    const { data: jobs } = await supabase.from('jobs').select('*, users!jobs_posted_by_fkey(name, company)').eq('is_active', true);
    
    const userSkills = user?.skills || [];
    const scored = jobs?.map(job => {
      const jobSkills = job.required_skills || [];
      const matches = userSkills.filter(s => jobSkills.map(j => j.toLowerCase()).includes(s.toLowerCase()));
      const matchPct = jobSkills.length > 0 ? Math.round((matches.length / jobSkills.length) * 100) : 0;
      return { ...job, match_percentage: matchPct };
    }).sort((a, b) => b.match_percentage - a.match_percentage) || [];

    res.json(scored);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { error } = await supabase.from('jobs').update({ is_active: false }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Job removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
