import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";
import { RegisterDto, LoginDto } from "../models/User";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: RegisterDto = req.body;

    try {
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.message === "Invalid email format") {
        res.status(400).json({ message: err.message });
      } else if (
        err.message === "Password must be at least 8 characters long"
      ) {
        res.status(400).json({ message: err.message });
      } else if (err.message === "User with this email already exists") {
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
      } else if (err.message.includes("verify your email")) {
        res.status(403).json({ message: err.message });
      } else {
        throw err;
      }
    }
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Verification token is required" });
      return;
    }

    const result = await authService.verifyEmail(token);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    next(error);
  }
};
