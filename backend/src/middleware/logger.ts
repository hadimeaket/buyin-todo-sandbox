import { Request, Response, NextFunction } from "express";

export const logger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Skip logging for health check endpoint
  if (req.path !== '/api/health') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
  }
  next();
};
