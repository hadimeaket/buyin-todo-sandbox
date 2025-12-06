import axios, { AxiosError } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
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
    const axiosError = error as AxiosError<{ message: string }>;
    const message =
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

// Token management
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): { id: string; email: string } | null {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  setUser(user: { id: string; email: string }): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};

export const authApi = {
  // Register a new user
  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/api/auth/register", data);
      tokenStorage.setToken(response.data.token);
      tokenStorage.setUser(response.data.user);
      return response.data;
    } catch (error) {
      handleAuthError(error, "register");
    }
  },

  // Login with email and password
  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", data);
      tokenStorage.setToken(response.data.token);
      tokenStorage.setUser(response.data.user);
      return response.data;
    } catch (error) {
      handleAuthError(error, "login");
    }
  },

  // Logout (clear local storage)
  logout(): void {
    tokenStorage.clear();
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return tokenStorage.getToken() !== null;
  },

  // Get current user from storage
  getCurrentUser(): { id: string; email: string } | null {
    return tokenStorage.getUser();
  },
};
