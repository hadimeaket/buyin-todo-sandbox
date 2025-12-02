export interface User {
  id: string;
  email: string;
  name: string;
  authProvider: "email" | "google" | "apple";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}
