import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export class AuthApiError extends Error {
  public status?: number;
  public errorCode?: string;

  constructor(message: string, status?: number, errorCode?: string) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

const handleAuthError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorCode = error.response?.data?.error;
    const message = error.response?.data?.message || error.message;
    throw new AuthApiError(message, error.response?.status, errorCode);
  }
  throw new Error("Unexpected error during authentication");
};

export const authApi = {
  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/api/auth/register", data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },
};
