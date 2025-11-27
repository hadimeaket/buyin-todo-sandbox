import { Router } from "express";
import healthRoutes from "./healthRoutes";
import todoRoutes from "./todoRoutes";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";
import attachmentRoutes from "./attachmentRoutes";
import icsRoutes from "./icsRoutes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/todos", todoRoutes);
router.use("/categories", categoryRoutes);
router.use("/ics", icsRoutes);
router.use("/", attachmentRoutes);

export default router;
