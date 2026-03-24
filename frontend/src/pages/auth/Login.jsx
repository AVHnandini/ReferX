import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AuthForm from "../../components/AuthForm";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (payload) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await authService.login(payload);
      login(data.token, data.user);
      const target =
        data.user.role === 'student'
          ? '/student/dashboard'
          : data.user.role === 'alumni'
            ? '/alumni/dashboard'
            : data.user.role === 'admin'
              ? '/admin/dashboard'
              : '/login';
      navigate(target);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to login. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm mode="login" onSubmit={onSubmit} loading={loading} error={error} />;
}
