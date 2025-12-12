import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository";
import { CreateUserDto, User, UserResponse } from "../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

class AuthService {
  /**
   * Register a new user with email and password
   */
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate password
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await UserRepository.create({
      email,
      password_hash,
      provider: "email",
      name,
    });

    return this.generateAuthResponse(user);
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user uses email/password auth
    if (user.provider !== "email" || !user.password_hash) {
      throw new Error(`Please login with ${user.provider}`);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    return this.generateAuthResponse(user);
  }

  /**
   * Login or register with OAuth provider (Google, Apple)
   */
  async loginWithProvider(
    provider: "google" | "apple",
    providerId: string,
    email: string,
    name?: string
  ): Promise<AuthResponse> {
    // Try to find existing user by provider
    let user = await UserRepository.findByProvider(provider, providerId);

    if (!user) {
      // Try to find by email (linking accounts)
      user = await UserRepository.findByEmail(email);

      if (user) {
        // Update existing user with provider info
        user = (await UserRepository.update(user.id, {
          provider,
          provider_id: providerId,
        })) as User;
      } else {
        // Create new user
        user = await UserRepository.create({
          email,
          provider,
          provider_id: providerId,
          name,
        });
      }
    }

    return this.generateAuthResponse(user);
  }

  /**
   * Verify JWT token and return user ID
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Generate JWT token and auth response
   */
  private generateAuthResponse(user: User): AuthResponse {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      provider: user.provider,
      name: user.name,
      email_verified: user.email_verified,
      created_at: user.created_at,
    };
  }
}

export default new AuthService();
