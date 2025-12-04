import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import type { LoginData, RegisterData } from "../../types/user";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string>("");
  const { login, register } = useAuth();

  const handleLogin = async (data: LoginData) => {
    try {
      setError("");
      await login(data);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      setError("");
      await register(data);
    } catch (err: any) {
      setError(err.message || "Failed to register");
    }
  };

  return isLogin ? (
    <LoginForm
      onSubmit={handleLogin}
      onSwitchToRegister={() => {
        setIsLogin(false);
        setError("");
      }}
      error={error}
    />
  ) : (
    <RegisterForm
      onSubmit={handleRegister}
      onSwitchToLogin={() => {
        setIsLogin(true);
        setError("");
      }}
      error={error}
    />
  );
}
