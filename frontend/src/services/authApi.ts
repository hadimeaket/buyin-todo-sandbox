import axios from "axios";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/register",
      credentials
    );
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );
    return response.data;
  },

  async googleAuth(credential: string): Promise<AuthResponse> {
    // Decode JWT token to extract user info
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    const response = await api.post<AuthResponse>("/api/auth/google", {
      email: payload.email,
      providerId: payload.sub,
      name: payload.name,
    });
    return response.data;
  },

  async appleAuth(
    authorizationCode: string,
    user?: { email?: string; name?: { firstName?: string; lastName?: string } }
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/auth/apple", {
      email: user?.email,
      providerId: authorizationCode,
      name: user?.name ? `${user.name.firstName || ''} ${user.name.lastName || ''}`.trim() : undefined,
    });
    return response.data;
  },

  async getCurrentUser(token: string): Promise<User> {
    const response = await api.get<User>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
