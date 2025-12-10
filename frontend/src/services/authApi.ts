import axios, { AxiosError } from "axios";
import type { User, RegisterDto, LoginDto } from "../types/user";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export class ApiError extends Error {
  public status?: number;
  public data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const handleApiError = (error: unknown, context: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error: string }>;
    const message =
      axiosError.response?.data?.error || axiosError.message || "Unknown error";
    console.error(`API Error [${context}]:`, message);
    throw new ApiError(
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
      throw handleApiError(error, "register");
    }
  },

  // Login
  async login(data: LoginDto): Promise<User> {
    try {
      const response = await api.post<User>("/api/auth/login", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, "login");
    }
  },

  // Get profile
  async getProfile(userId: string): Promise<User> {
    try {
      const response = await api.get<User>("/api/auth/profile", {
        headers: {
          "x-user-id": userId,
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, "getProfile");
    }
  },
};
