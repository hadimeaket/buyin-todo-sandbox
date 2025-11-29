import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";
import { CreateUserDto, LoginDto } from "../models/User";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body as CreateUserDto;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: "EMAIL_AND_PASSWORD_REQUIRED" });
      return;
    }

    try {
      const result = await authService.register(email, password, name);
      res.status(201).json(result);
    } catch (err: any) {
      if (err.message === "INVALID_EMAIL") {
        res.status(400).json({ error: "INVALID_EMAIL" });
      } else if (err.message === "PASSWORD_TOO_SHORT") {
        res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
      } else if (err.message === "EMAIL_ALREADY_EXISTS") {
        res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
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
    const { email, password } = req.body as LoginDto;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ error: "EMAIL_AND_PASSWORD_REQUIRED" });
      return;
    }

    try {
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        res.status(401).json({ error: "INVALID_CREDENTIALS" });
      } else {
        throw err;
      }
    }
  } catch (error) {
    next(error);
  }
};
