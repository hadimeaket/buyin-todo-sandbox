import { useState, type FormEvent } from "react";
import { authApi } from "../../services/authApi";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input } from "../../components/ui";
import "./Auth.scss";

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const user = await authApi.login({ email, password });
        setUser(user);
        onSuccess?.();
      } else {
        // Validate registration
        if (!name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        if (!email.includes("@")) {
          setError("Please enter a valid email");
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters");
          setLoading(false);
          return;
        }

        const user = await authApi.register({ name, email, password });
        setUser(user);
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__card">
          <h1 className="auth__title">{isLogin ? "Login" : "Register"}</h1>
          <p className="auth__subtitle">
            {isLogin
              ? "Welcome back! Please login to your account."
              : "Create a new account to get started."}
          </p>

          <form onSubmit={handleSubmit} className="auth__form">
            {!isLogin && (
              <Input
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                autoComplete="name"
              />
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />

            {error && <div className="auth__error">{error}</div>}

            <Button
              type="submit"
              variant="primary"
              className="auth__submit"
              disabled={loading}
            >
              {loading ? "Loading..." : isLogin ? "Login" : "Register"}
            </Button>
          </form>

          <div className="auth__toggle">
            <span className="auth__toggle-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="auth__toggle-btn"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
