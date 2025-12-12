export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  provider: "email" | "google" | "apple";
  provider_id: string | null;
  name: string | null;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  password?: string;
  provider?: "email" | "google" | "apple";
  provider_id?: string;
  name?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  provider: string;
  name: string | null;
  email_verified: boolean;
  created_at: Date;
}
