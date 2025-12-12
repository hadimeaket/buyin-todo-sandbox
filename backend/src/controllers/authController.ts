import { Request, Response, NextFunction } from "express";
import AuthService from "../services/AuthService";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const result = await AuthService.register(email, password, name);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const result = await AuthService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // userId is set by auth middleware
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // In a real app, you'd fetch user details here
    res.status(200).json({ userId });
  } catch (error) {
    next(error);
  }
};
