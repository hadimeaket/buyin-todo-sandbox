import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi, authStorage } from "../services/authApi";
import type { User, LoginDto, RegisterDto } from "../services/authApi";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const initAuth = async () => {
      const token = authStorage.getToken();
      const storedUser = authStorage.getUser();
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const currentUser = await authApi.getCurrentUser(token);
          setUser(currentUser);
        } catch (error) {
          // Token invalid, clear storage
          authStorage.clear();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginDto) => {
    const response = await authApi.login(data);
    authStorage.setToken(response.token);
    authStorage.setUser(response.user);
    setUser(response.user);
  };

  const register = async (data: RegisterDto) => {
    const response = await authApi.register(data);
    authStorage.setToken(response.token);
    authStorage.setUser(response.user);
    setUser(response.user);
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
