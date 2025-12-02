import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth";
import { authApi } from "../services/authApi";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  loginWithApple: (authorizationCode: string, user?: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Optionally verify token is still valid
      authApi
        .getCurrentUser(storedToken)
        .then((user) => {
          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        });
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await authApi.register(credentials);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const loginWithGoogle = async (credential: string) => {
    const response = await authApi.googleAuth(credential);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const loginWithApple = async (authorizationCode: string, user?: any) => {
    const response = await authApi.appleAuth(authorizationCode, user);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        loginWithApple,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
