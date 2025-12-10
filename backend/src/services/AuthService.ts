import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";
import { CreateUserDto, LoginDto, AuthResponse, UserResponse } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";
const BCRYPT_ROUNDS = 10;

/**
 * AuthService - Authentication und Authorization
 * 
 * Handles:
 * - User Registration mit Passwort-Hashing
 * - User Login mit Token-Generierung
 * - Token-Validierung
 */
export class AuthService {
  /**
   * Registriert einen neuen Benutzer
   */
  async register(data: CreateUserDto): Promise<AuthResponse> {
    // Validierung: E-Mail Format
    if (!this.isValidEmail(data.email)) {
      throw new Error("Invalid email format");
    }

    // Validierung: Passwort mindestens 8 Zeichen
    if (!data.password || data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Prüfe ob E-Mail bereits existiert
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Hash Passwort
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    // Erstelle User
    const user = await userRepository.create({
      email: data.email,
      password: data.password,
      name: data.name,
      passwordHash,
    });

    // Generiere Token
    const token = this.generateToken(user.id, user.email);

    return {
      user: this.toUserResponse(user),
      token,
    };
  }

  /**
   * Meldet einen Benutzer an
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // Finde User by Email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verifiziere Passwort
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generiere Token
    const token = this.generateToken(user.id, user.email);

    return {
      user: this.toUserResponse(user),
      token,
    };
  }

  /**
   * Mock SSO Login (Google/Apple)
   */
  async mockSSOLogin(email: string, provider: "google" | "apple"): Promise<AuthResponse> {
    // Prüfe ob User bereits existiert
    let user = await userRepository.findByEmail(email);

    // Falls nicht, erstelle Mock-User
    if (!user) {
      const mockPassword = `${provider}-mock-${Date.now()}`;
      const passwordHash = await bcrypt.hash(mockPassword, BCRYPT_ROUNDS);

      user = await userRepository.create({
        email,
        password: mockPassword,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        passwordHash,
      });
    }

    // Generiere Token
    const token = this.generateToken(user.id, user.email);

    return {
      user: this.toUserResponse(user),
      token,
    };
  }

  /**
   * Validiert einen JWT Token
   */
  verifyToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  /**
   * Generiert einen JWT Token
   */
  private generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Konvertiert User zu UserResponse (ohne passwordHash)
   */
  private toUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Validiert E-Mail Format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authService = new AuthService();
