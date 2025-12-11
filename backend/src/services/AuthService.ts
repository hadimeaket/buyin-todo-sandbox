import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";
import {
  RegisterUserDto,
  LoginUserDto,
  AuthResponse,
  UserResponse,
} from "../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export class AuthService {
  async register(data: RegisterUserDto): Promise<AuthResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password length
    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: this.toUserResponse(user),
      token,
    };
  }

  async login(data: LoginUserDto): Promise<AuthResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user: this.toUserResponse(user),
      token,
    };
  }

  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  private toUserResponse(user: {
    id: string;
    email: string;
    createdAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
