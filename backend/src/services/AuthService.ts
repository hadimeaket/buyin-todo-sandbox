import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";
import { AuthResponse } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const SALT_ROUNDS = 10;

export class AuthService {
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    // Validate email format
    if (!email || !email.includes("@")) {
      throw new Error("INVALID_EMAIL");
    }

    // Validate password length
    if (!password || password.length < 8) {
      throw new Error("PASSWORD_TOO_SHORT");
    }

    // Check if user already exists
    const existingUser = userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = userRepository.create({
      email,
      passwordHash,
      name,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const user = userRepository.findByEmail(email);
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
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
      throw new Error("INVALID_TOKEN");
    }
  }
}

export const authService = new AuthService();
