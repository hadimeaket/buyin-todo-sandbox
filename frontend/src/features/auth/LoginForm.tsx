import { useState } from "react";
import type { LoginData } from "../../types/user";
import "./AuthForm.scss";

interface LoginFormProps {
  onSubmit: (data: LoginData) => Promise<void>;
  onSwitchToRegister: () => void;
  error?: string;
}

export default function LoginForm({
  onSubmit,
  onSwitchToRegister,
  error,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ email, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-form__container">
        <h1 className="auth-form__title">Welcome Back</h1>
        <p className="auth-form__subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form__form">
          {error && (
            <div className="auth-form__error">
              <svg
                className="auth-form__error-icon"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="auth-form__field">
            <label htmlFor="email" className="auth-form__label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-form__input"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password" className="auth-form__label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-form__input"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="auth-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          <div className="auth-form__switch">
            <span>Don't have an account?</span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="auth-form__switch-button"
              disabled={isSubmitting}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
