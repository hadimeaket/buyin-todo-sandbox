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
    const user = await authService.register(data);

    // Regenerate session and set user data
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regenerate error:", err);
          reject(err);
          return;
        }

        // Set session data
        req.session.userId = user.id;
        req.session.email = user.email;

        // Save the session
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            reject(saveErr);
          } else {
            resolve();
          }
        });
      });
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    if (
      error.message === "Password must be at least 8 characters long" ||
      error.message === "Valid email is required" ||
      error.message === "User with this email already exists"
    ) {
      res.status(400).json({ message: error.message });
    } else {
      console.error("Registration error:", error);
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
    const user = await authService.login(data);

    // Regenerate session and set user data
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regenerate error:", err);
          reject(err);
          return;
        }

        // Set session data
        req.session.userId = user.id;
        req.session.email = user.email;

        // Save the session
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            reject(saveErr);
          } else {
            resolve();
          }
        });
      });
    });

    res.status(200).json({
      id: user.id,
      email: user.email,
    });
  } catch (error: any) {
    if (error.message === "Invalid email or password") {
      res.status(401).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const logout = (req: Request, res: Response): void => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Failed to logout" });
        return;
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  } else {
    res.status(200).json({ message: "Logged out successfully" });
  }
};

export const getCurrentUser = (req: Request, res: Response): void => {
  if (req.session?.userId) {
    const user = authService.getUserById(req.session.userId);
    if (user) {
      res.status(200).json({
        id: user.id,
        email: user.email,
      });
      return;
    }
  }
  res.status(401).json({ message: "Not authenticated" });
};
