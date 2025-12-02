export interface User {
  id: string;
  email: string;
  password?: string; // Optional for SSO users
  provider: "local" | "google" | "apple";
  providerId?: string; // ID from OAuth provider
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password?: string;
  provider?: "local" | "google" | "apple";
  providerId?: string;
  name?: string;
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
    name?: string;
    provider: string;
  };
}
