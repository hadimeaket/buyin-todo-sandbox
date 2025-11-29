import { Router } from "express";
import healthRoutes from "./healthRoutes";
import todoRoutes from "./todoRoutes";
import authRoutes from "./authRoutes";
import attachmentRoutes from "./attachmentRoutes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/todos", todoRoutes);
router.use("/", attachmentRoutes);

export default router;
