import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthForms.scss";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email, password, name || undefined);
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h1 className="auth-form-title">Create Account</h1>
        <p className="auth-form-subtitle">Sign up to get started</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-form-error" role="alert">
              {error}
            </div>
          )}

          <div className="auth-form-field">
            <label htmlFor="name" className="auth-form-label">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-form-input"
              placeholder="John Doe"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="auth-form-field">
            <label htmlFor="email" className="auth-form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-form-input"
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-field">
            <label htmlFor="password" className="auth-form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-form-input"
              placeholder="••••••••"
              required
              minLength={8}
              disabled={isSubmitting}
            />
            <p className="auth-form-hint">Must be at least 8 characters</p>
          </div>

          <button
            type="submit"
            className="auth-form-button"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-form-footer">
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-form-link"
              disabled={isSubmitting}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
