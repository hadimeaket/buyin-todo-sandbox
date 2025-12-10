import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.scss';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, mockSSOLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setIsLoading(false);
          return;
        }
        await register(email, password, name);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = async (provider: 'google' | 'apple') => {
    setError('');
    setIsLoading(true);

    try {
      await mockSSOLogin(provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">{isLogin ? 'Login' : 'Register'}</h1>
          
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={isLoading}
                  required={!isLogin}
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
                placeholder="you@example.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
                minLength={8}
              />
              {!isLogin && (
                <small className="form-hint">Minimum 8 characters</small>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary btn-full-width"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="sso-buttons">
            <button
              type="button"
              className="btn-sso btn-google"
              onClick={() => handleSSOLogin('google')}
              disabled={isLoading}
            >
              <span className="sso-icon">G</span>
              Continue with Google
            </button>
            <button
              type="button"
              className="btn-sso btn-apple"
              onClick={() => handleSSOLogin('apple')}
              disabled={isLoading}
            >
              <span className="sso-icon"></span>
              Continue with Apple
            </button>
          </div>

          <div className="toggle-mode">
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-link"
              disabled={isLoading}
            >
              {isLogin
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
