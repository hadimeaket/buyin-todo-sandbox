import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";
import { User } from "../models/User";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token and get user
    const user = await authService.verifyToken(token);

    // Attach user to request
    req.user = user;

    next();
  } catch (error: any) {
    res.status(401).json({
      message: error.message || "Invalid or expired token",
    });
  }
};
