/**
 * Authentication Service
 *
 * Handles user authentication logic including:
 * - Registration (email + password)
 * - Login
 * - SSO (Mock implementation)
 * - Password hashing and verification
 * - JWT token generation
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";
import {
  User,
  RegisterDto,
  LoginDto,
  SSODto,
  AuthResponse,
} from "../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const BCRYPT_ROUNDS = 10;

export class AuthService {
  /**
   * Generate JWT token for user
   */
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Compare password with hashed password
   */
  private async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Convert User document to User response (without password)
   */
  private toUserResponse(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      authProvider: doc.authProvider,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Register new user with email and password
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password length
    if (!data.password || data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const userDoc = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    // Generate token
    const token = this.generateToken(userDoc._id.toString());

    // Return user and token
    return {
      user: this.toUserResponse(userDoc),
      token,
    };
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const userDoc = await userRepository.findByEmail(data.email);

    if (!userDoc) {
      throw new Error("Invalid email or password");
    }

    // Check auth provider
    if (userDoc.authProvider !== "email") {
      throw new Error(`Please sign in with ${userDoc.authProvider}`);
    }

    // Verify password
    if (!userDoc.password) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await this.comparePassword(
      data.password,
      userDoc.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate token
    const token = this.generateToken(userDoc._id.toString());

    // Return user and token
    return {
      user: this.toUserResponse(userDoc),
      token,
    };
  }

  /**
   * SSO Login/Register (Mock Implementation)
   * In production, this would validate OAuth tokens
   */
  async ssoAuth(data: SSODto): Promise<AuthResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    // Check if user exists
    let userDoc = await userRepository.findByEmail(data.email);

    if (!userDoc) {
      // Create new user for SSO
      userDoc = await userRepository.create({
        email: data.email,
        name: data.name,
        provider: data.provider,
      });
    } else {
      // User exists, verify they're using the same provider
      if (userDoc.authProvider === "email") {
        throw new Error(
          "Email already registered. Please sign in with email and password"
        );
      }
    }

    // Generate token
    const token = this.generateToken(userDoc._id.toString());

    // Return user and token
    return {
      user: this.toUserResponse(userDoc),
      token,
    };
  }

  /**
   * Verify JWT token and return user ID
   */
  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Get user by ID (used by auth middleware)
   */
  async getUserById(userId: string): Promise<User | null> {
    return userRepository.findById(userId);
  }
}

export const authService = new AuthService();
