import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";
import { CreateUserDto, LoginDto } from "../models/User";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateUserDto = req.body;
    
    try {
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.message === "Invalid email format") {
        res.status(400).json({ message: err.message });
      } else if (err.message === "Password must be at least 8 characters long") {
        res.status(400).json({ message: err.message });
      } else if (err.message === "Email already registered") {
        res.status(409).json({ message: err.message });
      } else {
        throw err;
      }
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: LoginDto = req.body;
    
    try {
      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (err: any) {
      if (err.message === "Invalid email or password") {
        res.status(401).json({ message: err.message });
      } else {
        throw err;
      }
    }
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // User ID is set by auth middleware
    const userId = (req as any).userId;
    
    const user = await authService.getCurrentUser(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
