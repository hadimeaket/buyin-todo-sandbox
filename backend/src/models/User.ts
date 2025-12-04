/**
 * User Type Definitions
 *
 * Defines interfaces for User entity and DTOs for
 * authentication operations
 */

export type AuthProvider = "email" | "google" | "apple";

export interface User {
  id: string;
  email: string;
  name?: string;
  authProvider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SSODto {
  email: string;
  name?: string;
  provider: "google" | "apple";
}

export interface AuthResponse {
  user: User;
  token: string;
}
