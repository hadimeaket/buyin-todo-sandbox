import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input } from "../../components/ui";
import "./AuthForm.scss";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password.length < 8) {
          setError("Password must be at least 8 characters long");
          setIsSubmitting(false);
          return;
        }
        await register(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h1 className="auth-form-title">
          {isLogin ? "Sign In" : "Create Account"}
        </h1>
        <p className="auth-form-subtitle">
          {isLogin
            ? "Welcome back! Please sign in to continue."
            : "Sign up to start managing your todos."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-field">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="auth-form-field">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? "Enter your password" : "Minimum 8 characters"}
              required
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="auth-form-error">{error}</div>}

          <Button
            type="submit"
            variant="primary"
            className="auth-form-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="auth-form-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="auth-form-switch-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            disabled={isSubmitting}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
