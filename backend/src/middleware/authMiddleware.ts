import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";

// Erweitere Express Request um userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Auth Middleware - Validiert JWT Token
 * 
 * Prüft ob Authorization Header vorhanden ist und Token gültig ist
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Hole Token aus Authorization Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Validiere Token
    const decoded = authService.verifyToken(token);

    // Füge userId und email zu Request hinzu
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
