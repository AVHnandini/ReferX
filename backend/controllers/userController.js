import { supabase } from "../config/supabase.js";

export const getProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, name, email, role, company, job_role, experience, linkedin, skills, resume, profile_score, verification_status, created_at",
      )
      .eq("id", req.user.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role;
    delete updates.id;

    // Recalculate profile score
    let score = 10;
    if (updates.name) score += 10;
    if (updates.company) score += 10;
    if (updates.skills?.length > 0) score += 20;
    if (updates.resume) score += 25;
    if (updates.linkedin) score += 15;
    if (updates.experience) score += 10;
    updates.profile_score = Math.min(score, 100);

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, name, email, role, company, verification_status, profile_score, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAlumni = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, name, email, company, job_role, years_experience, linkedin_url, skills, bio, avatar_url, profile_score",
      )
      .eq("role", "alumni")
      .eq("verification_status", "approved");
    if (error) throw error;
    res.json({ alumni: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
