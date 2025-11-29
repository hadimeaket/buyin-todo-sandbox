import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }

    // Check Bearer format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }

    const token = parts[1];

    // Verify token
    try {
      const decoded = authService.verifyToken(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
      next();
    } catch (error) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }
  } catch (error) {
    next(error);
  }
};
