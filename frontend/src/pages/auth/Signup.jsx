import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/api";
import AuthForm from "../../components/AuthForm";

export default function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [roleParam] = useState(params.get("role") || "student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (payload) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await authService.signup(payload);
      navigate("/verify-otp", {
        state: { email: payload.email, devOtp: data.devOtp },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Unable to signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      mode="signup"
      initialRole={roleParam}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
    />
  );
}
