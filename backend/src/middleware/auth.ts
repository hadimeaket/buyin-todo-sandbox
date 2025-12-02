import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
      };

      req.userId = decoded.userId;
      req.user = { id: decoded.userId, email: decoded.email };
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    next(error);
  }
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });
};
