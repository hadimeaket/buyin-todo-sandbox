import { Router } from "express";
import { authController } from "../controllers/authController";

const router = Router();

// POST /api/auth/register - Register a new user
router.post("/register", (req, res) => authController.register(req, res));

// POST /api/auth/login - Login user
router.post("/login", (req, res) => authController.login(req, res));

export default router;
