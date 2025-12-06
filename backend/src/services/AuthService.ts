import { userRepository } from "../repositories/UserRepository";
import { RegisterDto, LoginDto, AuthResponse } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
// Default to 7 days in seconds
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : 604800;

export class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Validate email
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error("Invalid email address");
    }

    // Validate password (minimum 8 characters)
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

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    // Validate input
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }

    // Find user
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string }> {
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

  private generateToken(userId: string, email: string): string {
    const options: jwt.SignOptions = {
      expiresIn: JWT_EXPIRES_IN
    };
    return jwt.sign({ userId, email }, JWT_SECRET as jwt.Secret, options);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authService = new AuthService();
