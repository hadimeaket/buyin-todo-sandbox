import { Request, Response } from "express";
import { authService } from "../services/AuthService";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await authService.register({ email, password });
      
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      res.status(400).json({ error: message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login({ email, password });
      
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(401).json({ error: message });
    }
  }
}

export const authController = new AuthController();
