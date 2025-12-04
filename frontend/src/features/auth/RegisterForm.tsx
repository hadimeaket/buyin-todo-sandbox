import { useState } from "react";
import type { RegisterData } from "../../types/user";
import "./AuthForm.scss";

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>;
  onSwitchToLogin: () => void;
  error?: string;
}

export default function RegisterForm({
  onSubmit,
  onSwitchToLogin,
  error,
}: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate password length
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

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
        <h1 className="auth-form__title">Create Account</h1>
        <p className="auth-form__subtitle">Sign up to get started</p>

        <form onSubmit={handleSubmit} className="auth-form__form">
          {(error || validationError) && (
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
              <span>{error || validationError}</span>
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
              minLength={8}
            />
            <p className="auth-form__hint">Minimum 8 characters</p>
          </div>

          <div className="auth-form__field">
            <label htmlFor="confirmPassword" className="auth-form__label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>

          <div className="auth-form__switch">
            <span>Already have an account?</span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-form__switch-button"
              disabled={isSubmitting}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
