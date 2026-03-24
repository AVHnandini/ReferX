import React, { useMemo, useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, Briefcase, ShieldAlert, Linkedin } from "lucide-react";

const roles = [
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "alumni", label: "Alumni", icon: Briefcase },
  { id: "admin", label: "Admin", icon: ShieldAlert },
];

const baseInput = "input w-full";

export default function AuthForm({ mode = "signup", initialRole = "student", onSubmit, loading, error }) {
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeName: "",
    courseBranch: "",
    companyName: "",
    jobRole: "",
    experience: "",
    linkedin: "",
    skills: [],
  });

  const isLogin = mode === "login";
  const roleIsAlumni = role === "alumni";
  const roleIsStudent = role === "student";
  const roleIsAdmin = role === "admin";

  const headerTitle = useMemo(() => {
    if (isLogin) return "Welcome back";
    return "Create your account";
  }, [isLogin]);

  const description = useMemo(() => {
    if (isLogin) return "Login to access ReferX dashboard";
    return "Sign up and grow your referral network";
  }, [isLogin]);

  const setField = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (form.skills.includes(trimmed.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setForm((p) => ({ ...p, skills: [...p.skills, trimmed.toLowerCase()] }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  };

  const validate = () => {
    if (!form.email || !form.password) {
      return "Email and password are required.";
    }
    if (!isLogin && !form.name) {
      return "Full name is required.";
    }
    if (!isLogin && roleIsStudent && (!form.collegeName || !form.courseBranch)) {
      return "College name and course/branch are required for students.";
    }
    if (!isLogin && roleIsAlumni && (!form.companyName || !form.experience)) {
      return "Company and years of experience are required for alumni.";
    }
    if (!isLogin && form.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError("");

    const payload = {
      role,
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    if (!isLogin) {
      payload.name = form.name;
      if (roleIsStudent) {
        payload.collegeName = form.collegeName;
        payload.courseBranch = form.courseBranch;
        payload.skills = form.skills;
      }
      if (roleIsAlumni) {
        payload.companyName = form.companyName;
        payload.jobRole = form.jobRole;
        payload.experience = form.experience;
        payload.linkedin = form.linkedin;
        payload.skills = form.skills;
      }
    }

    onSubmit(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.5),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.35),transparent_45%)]" />
      <div className="absolute inset-0 backdrop-blur-xl" />

      <div className="relative w-full max-w-lg z-10">
        <div className="glass rounded-3xl shadow-2xl shadow-black/30 p-8 sm:p-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1">{headerTitle}</h2>
          <p className="text-gray-300 mb-6">{description}</p>

          <div className="flex rounded-xl bg-white/10 border border-white/10 overflow-hidden mb-6">
            {roles.map((item) => {
              const isActive = role === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`flex-1 py-2 text-sm sm:text-base font-medium transition-colors ${isActive ? "bg-white/20 text-white" : "text-gray-300 hover:bg-white/5"}`}
                >
                  <span className="flex items-center justify-center gap-2 capitalize">
                    <Icon size={16} />
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin ? (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={setField("name")}
                  className={baseInput + " pl-12"}
                  required={!isLogin}
                />
              </div>
            ) : null}

            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={setField("email")}
                className={baseInput + " pl-12"}
                required
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={setField("password")}
                className={baseInput + " pl-12 pr-12"}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={setField("confirmPassword")}
                  className={baseInput + " pl-12"}
                  required
                />
              </div>
            )}

            {/* Student-specific */}
            {roleIsStudent && !isLogin && (
              <>
                <input
                  type="text"
                  placeholder="College Name"
                  value={form.collegeName}
                  onChange={setField("collegeName")}
                  className={baseInput}
                  required
                />
                <input
                  type="text"
                  placeholder="Course / Branch"
                  value={form.courseBranch}
                  onChange={setField("courseBranch")}
                  className={baseInput}
                  required
                />
              </>
            )}

            {/* Alumni-specific */}
            {roleIsAlumni && !isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={form.companyName}
                  onChange={setField("companyName")}
                  className={baseInput}
                  required
                />
                <input
                  type="text"
                  placeholder="Job Role"
                  value={form.jobRole}
                  onChange={setField("jobRole")}
                  className={baseInput}
                />
                <input
                  type="number"
                  placeholder="Years of Experience"
                  value={form.experience}
                  onChange={setField("experience")}
                  className={baseInput}
                  min={0}
                  max={50}
                  required
                />
                <div className="relative">
                  <Linkedin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    placeholder="LinkedIn Profile URL"
                    value={form.linkedin}
                    onChange={setField("linkedin")}
                    className={baseInput + " pl-12"}
                  />
                </div>
              </>
            )}

            {/* Skills for student & alumni */}
            {!isLogin && (roleIsStudent || roleIsAlumni) && (
              <div>
                <div className="flex gap-2 items-center mb-2">
                  <input
                    type="text"
                    placeholder="Add a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className={baseInput + " flex-1"}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="btn-secondary text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-2 bg-white/10 text-gray-100 px-3 py-1 rounded-full text-xs">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-gray-300 hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(error || formError) && (
              <div className="p-3 text-sm rounded-xl bg-red-500/15 text-red-200 border border-red-500/20">
                {formError || error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-300 mt-5">
            {isLogin ? "Don’t have an account?" : "Already have an account?"}
          </p>
        </div>
      </div>
    </div>
  );
}
