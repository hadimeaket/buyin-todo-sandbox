import { userRepository } from "../repositories/UserRepository";
import { RegisterDto, LoginDto, AuthResponse } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
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

    // Create user with verification token
    const user = await userRepository.create(data);

    // Generate verification link (in production, send email)
    const verificationLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verify-email?token=${user.verificationToken}`;
    console.log("\n=== EMAIL VERIFICATION LINK ===");
    console.log(`User: ${user.email}`);
    console.log(`Link: ${verificationLink}`);
    console.log(`Token expires in 24 hours`);
    console.log("==============================\n");

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
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

    // Check if email is verified (for non-SSO users)
    if (!user.isVerified) {
      throw new Error(
        "Please verify your email before logging in. Check your email for the verification link."
      );
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async verifyEmail(
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const user = await userRepository.verifyEmail(token);

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired verification token",
      };
    }

    return {
      success: true,
      message: "Email verified successfully! You can now log in.",
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
      throw new Error("Invalid token");
    }
  }
}

export const authService = new AuthService();
