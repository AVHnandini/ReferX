import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  Mail,
  Lock,
  User,
  Building,
  Briefcase,
  Linkedin,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { authService } from "../../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: params.get("role") || "student",
    company: "",
    jobRole: "",
    experience: "",
    linkedin: "",
    adminKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authService.signup(form);
      navigate("/verify-otp", {
        state: { email: form.email, devOtp: data.devOtp },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const isAlumni = form.role === "alumni";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-brand-600/15 rounded-full blur-3xl top-10 -right-20 animate-float" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl p-8">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg">ReferX</span>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-1">
            Create account
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            Join the referral network
          </p>

          {/* Role Toggle */}
          <div className="flex gap-2 p-1 glass rounded-xl mb-6">
            {["student", "alumni", "admin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    role: r,
                    // Clear admin key if leaving admin role
                    adminKey: r === "admin" ? p.adminKey : "",
                  }))
                }
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize flex items-center justify-center gap-2
                  ${form.role === r ? "bg-brand-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                {r === "student" ? (
                  <GraduationCap size={14} />
                ) : r === "alumni" ? (
                  <Briefcase size={14} />
                ) : (
                  <Lock size={14} />
                )}{" "}
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                placeholder="Full name"
                value={form.name}
                onChange={set("name")}
                className="input pl-12"
                required
              />
            </div>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="email"
                placeholder={
                  isAlumni ? "Work email" : "College email (.edu, .ac.in)"
                }
                value={form.email}
                onChange={set("email")}
                className="input pl-12"
                required
              />
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="password"
                placeholder="Password (min 8 chars)"
                value={form.password}
                onChange={set("password")}
                className="input pl-12"
                required
                minLength={8}
              />
            </div>
            {form.role === "admin" && (
              <div className="relative">
                <input
                  type="password"
                  placeholder="Admin secret key"
                  value={form.adminKey}
                  onChange={set("adminKey")}
                  className="input pl-4"
                  required
                />
              </div>
            )}
            {isAlumni && (
              <>
                <div className="relative">
                  <Building
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    placeholder="Company"
                    value={form.company}
                    onChange={set("company")}
                    className="input pl-12"
                    required={isAlumni}
                  />
                </div>
                <div className="relative">
                  <Briefcase
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    placeholder="Job title / Role"
                    value={form.jobRole}
                    onChange={set("jobRole")}
                    className="input pl-12"
                  />
                </div>
                <input
                  placeholder="Years of experience"
                  type="number"
                  value={form.experience}
                  onChange={set("experience")}
                  className="input"
                  min={0}
                  max={50}
                />
                <div className="relative">
                  <Linkedin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    placeholder="LinkedIn profile URL"
                    value={form.linkedin}
                    onChange={set("linkedin")}
                    className="input pl-12"
                  />
                </div>
                <div className="p-3 glass rounded-xl text-xs text-amber-400">
                  Alumni accounts require verification. Upload your company ID
                  after signup.
                </div>
              </>
            )}

            {!isAlumni && (
              <p className="text-xs text-gray-500">
                Use your college email (.edu, .ac.in, etc.) to register as a
                student.
              </p>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
