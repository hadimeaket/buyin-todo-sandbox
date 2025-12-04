/**
 * Authentication Routes
 *
 * Defines routes for authentication endpoints
 */

import { Router } from "express";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/google", (req, res) => authController.googleAuth(req, res));
router.post("/apple", (req, res) => authController.appleAuth(req, res));

// Protected routes
router.get("/me", authMiddleware, (req, res) =>
  authController.getCurrentUser(req, res)
);

export default router;
