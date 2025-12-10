import { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { RegisterDto, LoginDto } from "../models/User";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterDto = {
        email: req.body.email,
        password: req.body.password,
      };

      const result = await authService.register(data);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          res.status(409).json({ message: error.message });
        } else if (
          error.message.includes("Invalid email") ||
          error.message.includes("Password must be")
        ) {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: "Internal server error" });
        }
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginDto = {
        email: req.body.email,
        password: req.body.password,
      };

      const result = await authService.login(data);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid email or password")) {
          res.status(401).json({ message: error.message });
        } else {
          res.status(500).json({ message: "Internal server error" });
        }
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async getMe(req: Request, res: Response): Promise<void> {
    try {
      // User is attached to request by auth middleware
      const user = (req as any).user;
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export const authController = new AuthController();
