export interface User {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface RegisterUserDto {
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}
