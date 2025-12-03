import axios, { AxiosError } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookie-based sessions
});

export interface User {
  id: number;
  email: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthError extends Error {
  public status?: number;
  public data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.data = data;
  }
}

const handleAuthError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error: string; message: string }>;
    const message =
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unknown error";
    console.error(`Auth Error [${context}]:`, message);
    throw new AuthError(
      message,
      axiosError.response?.status,
      axiosError.response?.data
    );
  }
  console.error(`Unexpected Error [${context}]:`, error);
  throw new Error(`Unexpected error in ${context}`);
};

export const authApi = {
  // Register a new user
  async register(data: RegisterDto): Promise<User> {
    try {
      const response = await api.post<User>("/api/auth/register", data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error, "register");
    }
  },

  // Login
  async login(data: LoginDto): Promise<User> {
    try {
      const response = await api.post<User>("/api/auth/login", data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error, "login");
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      throw handleAuthError(error, "logout");
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>("/api/auth/me");
      return response.data;
    } catch (error) {
      throw handleAuthError(error, "getCurrentUser");
    }
  },
};
