import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";
import { RegisterDto, LoginDto, GoogleAuthDto, AppleAuthDto } from "../models/User";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: RegisterDto = req.body;
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (error: any) {
    if (
      error.message === "Password must be at least 8 characters long" ||
      error.message === "Invalid email address" ||
      error.message === "Name is required"
    ) {
      res.status(400).json({ message: error.message });
    } else if (error.message === "User with this email already exists") {
      res.status(409).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: LoginDto = req.body;
    const result = await authService.login(data);
    res.status(200).json(result);
  } catch (error: any) {
    if (
      error.message === "Invalid email or password" ||
      error.message === "Email and password are required" ||
      error.message.includes("This account uses")
    ) {
      res.status(401).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: GoogleAuthDto = req.body;
    const result = await authService.googleAuth(data);
    res.status(200).json(result);
  } catch (error: any) {
    if (
      error.message === "Google authentication is not configured" ||
      error.message === "Invalid Google token" ||
      error.message.includes("already exists using")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const appleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: AppleAuthDto = req.body;
    const result = await authService.appleAuth(data);
    res.status(200).json(result);
  } catch (error: any) {
    if (
      error.message === "Invalid Apple token" ||
      error.message.includes("already exists using")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      authProvider: req.user.authProvider,
    });
  } catch (error) {
    next(error);
  }
};
