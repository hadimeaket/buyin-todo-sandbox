/**
 * Authentication Controller
 *
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { RegisterDto, LoginDto, SSODto } from "../models/User";

export class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterDto = req.body;

      // Validate required fields
      if (!data.email || !data.password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Register error:", error);

      if (error.message.includes("already exists")) {
        res.status(409).json({ message: error.message });
      } else if (
        error.message.includes("Invalid") ||
        error.message.includes("must be")
      ) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginDto = req.body;

      // Validate required fields
      if (!data.email || !data.password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.message.includes("Invalid email or password")) {
        res.status(401).json({ message: "Invalid email or password" });
      } else if (error.message.includes("sign in with")) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to login" });
      }
    }
  }

  /**
   * Google SSO (Mock)
   * POST /api/auth/google
   */
  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const data: SSODto = {
        email,
        name,
        provider: "google",
      };

      const result = await authService.ssoAuth(data);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Google auth error:", error);

      if (error.message.includes("already registered")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to authenticate with Google" });
      }
    }
  }

  /**
   * Apple SSO (Mock)
   * POST /api/auth/apple
   */
  async appleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const data: SSODto = {
        email,
        name,
        provider: "apple",
      };

      const result = await authService.ssoAuth(data);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Apple auth error:", error);

      if (error.message.includes("already registered")) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to authenticate with Apple" });
      }
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // User is attached to request by auth middleware
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  }
}

export const authController = new AuthController();
