import { userRepository } from "../repositories/UserRepository";
import { RegisterDto, LoginDto, UserResponse } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

export interface AuthResponse extends UserResponse {
  token: string;
}

export class AuthService {
  private generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    // Validate email
    if (!data.email || !EMAIL_REGEX.test(data.email)) {
      throw new Error("Invalid email address");
    }

    // Validate password
    if (!data.password || data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
    });

    const userResponse = userRepository.toUserResponse(user);
    const token = this.generateToken(user.id, user.email);

    return {
      ...userResponse,
      token,
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    // Validate input
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }

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

    const userResponse = userRepository.toUserResponse(user);
    const token = this.generateToken(user.id, user.email);

    return {
      ...userResponse,
      token,
    };
  }

  verifyToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
      };
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await userRepository.findById(id);
    if (!user) {
      return null;
    }
    return userRepository.toUserResponse(user);
  }
}

export const authService = new AuthService();
