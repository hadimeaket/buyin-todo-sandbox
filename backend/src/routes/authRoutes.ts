import { Router, Request, Response } from "express";
import { authService } from "../services/AuthService";
import { RegisterUserDto, LoginUserDto } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Register new user
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const data: RegisterUserDto = req.body;
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// Login user
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const data: LoginUserDto = req.body;
    const result = await authService.login(data);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// Get current user (protected route)
router.get(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { userRepository } = await import("../repositories/UserRepository");
      const user = await userRepository.findById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
