import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";
import { RegisterDto, LoginDto, AuthResponse } from "../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const { email, password } = data;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate password length (minimum 8 characters)
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await userRepository.create(email, passwordHash);

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
    const { email, password } = data;

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
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

  async verifyToken(token: string): Promise<{ id: string; email: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
      };
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  private generateToken(id: string, email: string): string {
    return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}

export const authService = new AuthService();
