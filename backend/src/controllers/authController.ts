import { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { RegisterDto, LoginDto } from "../models/User";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: RegisterDto = req.body;
    const user = await authService.register(data);
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
    const data: LoginDto = req.body;
    const user = await authService.login(data);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.headers["x-user-id"] as string;

    if (!userId) {
      res.status(401).json({ error: "User ID is required" });
      return;
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
