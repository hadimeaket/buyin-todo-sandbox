import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi, AuthApiError } from "../services/authApi";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user data", err);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      const response = await authApi.login({ email, password });

      setUser(response.user);
      setToken(response.token);

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (err) {
      if (err instanceof AuthApiError) {
        if (err.errorCode === "INVALID_CREDENTIALS") {
          setError("Invalid email or password");
        } else if (err.errorCode === "EMAIL_AND_PASSWORD_REQUIRED") {
          setError("Email and password are required");
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    }
  };

  const register = async (
    email: string,
    password: string,
    name?: string
  ): Promise<void> => {
    try {
      setError(null);
      const response = await authApi.register({ email, password, name });

      setUser(response.user);
      setToken(response.token);

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (err) {
      if (err instanceof AuthApiError) {
        if (err.errorCode === "EMAIL_ALREADY_EXISTS") {
          setError("This email is already registered");
        } else if (err.errorCode === "PASSWORD_TOO_SHORT") {
          setError("Password must be at least 8 characters");
        } else if (err.errorCode === "INVALID_EMAIL") {
          setError("Please enter a valid email address");
        } else if (err.errorCode === "EMAIL_AND_PASSWORD_REQUIRED") {
          setError("Email and password are required");
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setError(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
