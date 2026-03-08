const supabase = require('../config/supabase');

exports.createJob = async (req, res) => {
  try {
    const { title, company, description, location, requiredSkills, salaryMin, salaryMax, applicationLink, jobType } = req.body;

    const jobData = {
      title, company, description, location,
      required_skills: requiredSkills || [],
      salary_min: salaryMin, salary_max: salaryMax,
      application_link: applicationLink,
      job_type: jobType || 'Full-time',
      posted_by: req.user.id,
    };

    const { data, error } = await supabase.from('jobs').insert(jobData).select().single();
    if (error) throw error;

    res.status(201).json({ job: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const { search, company, location } = req.query;
    let query = supabase
      .from('jobs')
      .select('*, poster:users!posted_by(id, name, company, avatar_url, job_role)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (search) query = query.ilike('title', `%${search}%`);
    if (company) query = query.ilike('company', `%${company}%`);
    if (location) query = query.ilike('location', `%${location}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ jobs: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, poster:users!posted_by(id, name, company, avatar_url, job_role, linkedin_url)')
      .eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Job not found' });
    res.json({ job: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecommendedJobs = async (req, res) => {
  try {
    const userSkills = req.user.skills || [];

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, poster:users!posted_by(id, name, company, avatar_url)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const scored = jobs.map(job => {
      const jobSkills = job.required_skills || [];
      const matches = userSkills.filter(s => jobSkills.some(js => js.toLowerCase().includes(s.toLowerCase()))).length;
      const matchPct = jobSkills.length > 0 ? Math.round((matches / jobSkills.length) * 100) : 0;
      return { ...job, match_percentage: Math.max(matchPct, 20) };
    }).sort((a, b) => b.match_percentage - a.match_percentage);

    res.json({ jobs: scored });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs').update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).eq('posted_by', req.user.id).select().single();
    if (error) throw error;
    res.json({ job: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { error } = await supabase.from('jobs').delete().eq('id', req.params.id).eq('posted_by', req.user.id);
    if (error) throw error;
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveJob = async (req, res) => {
  try {
    const { data, error } = await supabase.from('saved_jobs')
      .insert({ student_id: req.user.id, job_id: req.params.id }).select().single();
    if (error) throw error;
    res.json({ message: 'Job saved', saved: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('*, job:jobs(*)')
      .eq('student_id', req.user.id);
    if (error) throw error;
    res.json({ jobs: data.map(s => s.job) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
