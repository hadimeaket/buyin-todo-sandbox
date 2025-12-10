import { Router } from "express";
import { register, login, mockSSOLogin, getCurrentUser } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/sso-mock", mockSSOLogin);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);

export default router;
