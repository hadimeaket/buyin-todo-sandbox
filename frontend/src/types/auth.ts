export interface User {
  id: string;
  email: string;
  name?: string;
  provider: "local" | "google" | "apple";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
