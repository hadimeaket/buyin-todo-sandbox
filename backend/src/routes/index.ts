import { Router } from "express";
import healthRoutes from "./healthRoutes";
import todoRoutes from "./todoRoutes";
import authRoutes from "./authRoutes";
import attachmentRoutes from "./attachmentRoutes";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/todos", todoRoutes);
router.use("/todos", authenticate, attachmentRoutes);

export default router;
