import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Public routes
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

// Protected routes
router.get("/me", authenticate, (req, res) => authController.getMe(req, res));

export default router;
