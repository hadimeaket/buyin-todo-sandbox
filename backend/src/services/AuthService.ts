import { RegisterDto, LoginDto, UserResponse } from "../models/User";
import { userRepository } from "../repositories/UserRepository";

export class AuthService {
  async register(data: RegisterDto): Promise<UserResponse> {
    // Validate input
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Name is required");
    }

    if (!data.email || data.email.trim().length === 0) {
      throw new Error("Email is required");
    }

    if (!data.email.includes("@")) {
      throw new Error("Invalid email format");
    }

    if (!data.password || data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create user
    const user = await userRepository.create(data);

    // Return user without password
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(data: LoginDto): Promise<UserResponse> {
    // Validate input
    if (!data.email || data.email.trim().length === 0) {
      throw new Error("Email is required");
    }

    if (!data.password || data.password.length === 0) {
      throw new Error("Password is required");
    }

    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValid = await userRepository.verifyPassword(user, data.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Return user without password
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await userRepository.findById(id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
