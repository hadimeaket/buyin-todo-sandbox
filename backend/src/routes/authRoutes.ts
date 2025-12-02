import { Router } from "express";
import {
  register,
  login,
  googleAuth,
  appleAuth,
  getCurrentUser,
} from "../controllers/authController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/apple", appleAuth);

// Protected routes
router.get("/me", authenticate, getCurrentUser);

export default router;
