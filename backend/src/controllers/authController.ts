import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { RegisterUserDto, LoginUserDto } from "../models/User";

const authService = new AuthService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto: RegisterUserDto = req.body;

    if (!dto.email || !dto.password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const { user } = await authService.register(dto);

    // Set session
    req.session.userId = user.id;

    res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Password must be at least 8 characters long") {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error.message === "Email already registered") {
        res.status(409).json({ error: error.message });
        return;
      }
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dto: LoginUserDto = req.body;

    if (!dto.email || !dto.password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const { user } = await authService.login(dto);

    // Set session
    req.session.userId = user.id;

    res.status(200).json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      res.status(401).json({ error: error.message });
      return;
    }
    next(error);
  }
};

export const logout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
};

export const getCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = authService.getUserById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};
