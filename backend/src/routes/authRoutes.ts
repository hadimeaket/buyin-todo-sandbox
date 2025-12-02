import { Router, RequestHandler } from "express";
import {
  register,
  login,
  googleCallback,
  appleCallback,
  getCurrentUser,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/register", register as RequestHandler);
router.post("/login", login as RequestHandler);
router.post("/google", googleCallback as RequestHandler);
router.post("/apple", appleCallback as RequestHandler);

// Protected routes
router.get("/me", authenticate as RequestHandler, getCurrentUser as RequestHandler);

export default router;
