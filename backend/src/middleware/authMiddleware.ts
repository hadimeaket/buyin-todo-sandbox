/**
 * Authentication Middleware
 *
 * Validates JWT tokens and attaches user to request
 */

import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        authProvider: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const { userId } = authService.verifyToken(token);

    // Get user from database
    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);

    if (error.message.includes("Invalid or expired")) {
      res.status(401).json({ message: "Invalid or expired token" });
    } else {
      res.status(401).json({ message: "Authentication failed" });
    }
  }
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 * Useful for routes that have different behavior for authenticated users
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { userId } = authService.verifyToken(token);
      const user = await authService.getUserById(userId);

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log("Optional auth failed:", error);
  }

  next();
};
