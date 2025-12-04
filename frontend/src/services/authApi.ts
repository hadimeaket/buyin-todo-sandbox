import axios from "axios";
import type { User, RegisterData, LoginData } from "../types/user";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/sessions
});

export class AuthApiError extends Error {
  public status?: number;
  public data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.data = data;
  }
}

const handleApiError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as any;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unknown error";
    console.error(`API Error [${context}]:`, message);
    throw new AuthApiError(
      message,
      axiosError.response?.status,
      axiosError.response?.data
    );
  }
  console.error(`Unexpected Error [${context}]:`, error);
  throw new Error(`Unexpected error in ${context}`);
};

export const authApi = {
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await api.post<User>("/api/auth/register", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "register");
    }
  },

  async login(data: LoginData): Promise<User> {
    try {
      const response = await api.post<User>("/api/auth/login", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "login");
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      throw handleApiError(error, "logout");
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<User>("/api/auth/me");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      throw handleApiError(error, "getCurrentUser");
    }
  },
};
