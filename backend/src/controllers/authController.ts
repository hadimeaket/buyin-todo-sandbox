import { Request, Response } from "express";
import { authService } from "../services/AuthService";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.login(req.body);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
