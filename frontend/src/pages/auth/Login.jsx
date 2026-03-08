import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { authService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [adminKey, setAdminKey] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authService.login({
        ...form,
        adminKey: isAdmin ? adminKey : undefined,
      });
      login(data.token, data.user);
      navigate("/" + data.user.role);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-brand-600/20 rounded-full blur-3xl -top-20 -left-20 animate-float" />
      <div className="absolute w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl bottom-20 right-20 animate-float" />
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
          <h1 className="font-display text-3xl font-bold mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to your account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
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
                type={showPw ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                className="input pl-12 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <input
                id="admin-login"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-brand-400"
              />
              <label htmlFor="admin-login" className="select-none">
                Admin login (requires secret key)
              </label>
            </div>
            {isAdmin && (
              <div className="relative">
                <input
                  type="password"
                  placeholder="Admin secret key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="input pl-4"
                  required
                />
              </div>
            )}
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Sign up
            </Link>
          </p>
          <div className="mt-6 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <p className="text-xs text-brand-400 font-medium mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1 text-xs text-gray-400 font-mono">
              <p>Admin: admin@referx.com / admin123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
