import axios from 'axios';
import type { AuthResponse, LoginData, RegisterData, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/login', data);
    return response.data;
  },

  googleAuth: async (idToken: string): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/google', { idToken });
    return response.data;
  },

  appleAuth: async (idToken: string, user?: any): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/apple', { idToken, user });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await authApi.get<User>('/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};
