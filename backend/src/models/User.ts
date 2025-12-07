export interface User {
  id: string;
  email: string;
  password_hash: string;
  is_verified: boolean;
  verification_token?: string;
  token_expiry?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  is_verified: boolean;
  created_at: Date;
}
