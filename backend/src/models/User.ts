export type AuthProvider = "email" | "google" | "apple";

export interface User {
  id: string;
  email: string;
  password?: string; // Optional for SSO users
  name: string;
  authProvider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password?: string;
  name: string;
  authProvider: AuthProvider;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface GoogleAuthDto {
  idToken: string;
}

export interface AppleAuthDto {
  idToken: string;
  user?: {
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    authProvider: AuthProvider;
  };
}
