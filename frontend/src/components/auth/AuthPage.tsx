import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthPage.scss";

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");
  const { login, register, error, clearError, isLoading } = useAuth();

  const validateForm = (): boolean => {
    setLocalError("");

    if (!email || !email.includes("@")) {
      setLocalError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setLocalError("Password is required");
      return false;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters long");
      return false;
    }

    if (!isLogin && !name) {
      setLocalError("Name is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, name });
      }
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleGoogleSignIn = () => {
    setLocalError(
      "Google Sign-In requires configuration. Please set up your Google OAuth credentials."
    );
  };

  const handleAppleSignIn = () => {
    setLocalError(
      "Apple Sign-In requires configuration. Please set up your Apple OAuth credentials."
    );
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setLocalError("");
    clearError();
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to access your todos"
              : "Sign up to get started"}
          </p>

          {displayError && <div className="auth-error">{displayError}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password (min 8 characters)"
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-social">
            <button
              className="btn-social btn-google"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.593.102-1.17.282-1.709V4.959H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.041l3.007-2.335z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              Google
            </button>

            <button
              className="btn-social btn-apple"
              onClick={handleAppleSignIn}
              disabled={isLoading}
              type="button"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="currentColor"
              >
                <path d="M14.693 10.614c-.028 2.977 2.646 3.965 2.677 3.978-.022.07-.418 1.431-1.379 2.835-.83 1.213-1.693 2.423-3.051 2.447-1.336.024-1.765-.792-3.29-.792-1.526 0-2.003.768-3.267.816-1.311.049-2.304-1.308-3.139-2.518-1.708-2.473-3.013-6.988-1.26-10.035.869-1.511 2.423-2.467 4.108-2.492 1.284-.024 2.495.863 3.28.863.785 0 2.258-1.068 3.806-.91.648.027 2.469.262 3.638 1.973-.094.058-2.172 1.269-2.15 3.785m-2.49-7.343c.692-.84 1.159-2.007 1.031-3.168-.997.04-2.204.664-2.919 1.5-.642.742-1.204 1.928-1.053 3.067 1.114.086 2.252-.566 2.94-1.399" />
              </svg>
              Apple
            </button>
          </div>

          <div className="auth-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={switchMode}
              className="link-button"
              disabled={isLoading}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
