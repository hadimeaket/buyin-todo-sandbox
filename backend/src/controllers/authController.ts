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

    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === "Invalid email format") {
      res.status(400).json({ message: error.message });
    } else if (error.message === "Password must be at least 8 characters long") {
      res.status(400).json({ message: error.message });
    } else if (error.message === "Email already exists") {
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
    if (error.message === "Invalid credentials") {
      res.status(401).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const mockSSOLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider } = req.body as { provider: "google" | "apple" };

    if (!provider || !["google", "apple"].includes(provider)) {
      res.status(400).json({ message: "Invalid provider" });
      return;
    }

    // Mock E-Mail basierend auf Provider
    const email = `${provider}-user-${Date.now()}@test.com`;

    const result = await authService.mockSSOLogin(email, provider);
    res.status(200).json(result);
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
    // userId ist durch authMiddleware gesetzt
    if (!req.userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { userRepository } = await import("../repositories/UserRepository");
    const user = await userRepository.findById(req.userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Sende User ohne passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};
