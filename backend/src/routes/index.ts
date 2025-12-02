import { Router } from "express";
import healthRoutes from "./healthRoutes";
import todoRoutes from "./todoRoutes";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/todos", todoRoutes);
router.use("/categories", categoryRoutes);

export default router;
