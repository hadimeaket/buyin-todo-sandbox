import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { userRepository } from "../repositories/UserRepository";
import {
  User,
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  AppleAuthDto,
  AuthResponse,
} from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const JWT_EXPIRES_IN = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export class AuthService {
  private googleClient: OAuth2Client | null = null;

  constructor() {
    if (GOOGLE_CLIENT_ID) {
      this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    }
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  private createAuthResponse(user: User, token: string): AuthResponse {
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
      },
    };
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    // Validate email
    if (!data.email || !data.email.includes("@")) {
      throw new Error("Invalid email address");
    }

    // Validate password
    if (!data.password || data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Validate name
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Name is required");
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
      name: data.name,
      authProvider: "email",
    });

    // Generate token
    const token = this.generateToken(user.id);

    return this.createAuthResponse(user, token);
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

    // Check if user uses email authentication
    if (user.authProvider !== "email") {
      throw new Error(
        `This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`
      );
    }

    // Verify password
    if (!user.password) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate token
    const token = this.generateToken(user.id);

    return this.createAuthResponse(user, token);
  }

  async googleAuth(data: GoogleAuthDto): Promise<AuthResponse> {
    if (!this.googleClient) {
      throw new Error("Google authentication is not configured");
    }

    try {
      // Verify Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: data.idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error("Invalid Google token");
      }

      // Check if user exists
      let user = await userRepository.findByEmail(payload.email);

      if (user) {
        // User exists - verify they use Google auth
        if (user.authProvider !== "google") {
          throw new Error(
            `An account with this email already exists using ${user.authProvider} authentication.`
          );
        }
      } else {
        // Create new user
        user = await userRepository.create({
          email: payload.email,
          name: payload.name || payload.email.split("@")[0],
          authProvider: "google",
        });
      }

      // Generate token
      const token = this.generateToken(user.id);

      return this.createAuthResponse(user, token);
    } catch (error: any) {
      console.error("Google auth error:", error);
      throw new Error("Google authentication failed");
    }
  }

  async appleAuth(data: AppleAuthDto): Promise<AuthResponse> {
    try {
      // For Apple Sign-In, we would normally verify the identity token
      // This is a simplified implementation
      // In production, you would use apple-signin-auth or similar library
      
      // Decode the JWT without verification (for demo purposes)
      // In production, you MUST verify the token signature
      const decoded = jwt.decode(data.idToken) as any;
      
      if (!decoded || !decoded.email) {
        throw new Error("Invalid Apple token");
      }

      const email = decoded.email;
      let userName = email.split("@")[0];

      // Apple provides user info only on first sign-in
      if (data.user?.name) {
        const { firstName, lastName } = data.user.name;
        userName = [firstName, lastName].filter(Boolean).join(" ") || userName;
      }

      // Check if user exists
      let user = await userRepository.findByEmail(email);

      if (user) {
        // User exists - verify they use Apple auth
        if (user.authProvider !== "apple") {
          throw new Error(
            `An account with this email already exists using ${user.authProvider} authentication.`
          );
        }
      } else {
        // Create new user
        user = await userRepository.create({
          email: email,
          name: userName,
          authProvider: "apple",
        });
      }

      // Generate token
      const token = this.generateToken(user.id);

      return this.createAuthResponse(user, token);
    } catch (error: any) {
      console.error("Apple auth error:", error);
      throw new Error("Apple authentication failed");
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await userRepository.findById(decoded.userId);
      
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

export const authService = new AuthService();
