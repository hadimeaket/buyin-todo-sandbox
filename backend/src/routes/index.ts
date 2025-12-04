import { Router } from "express";
import healthRoutes from "./healthRoutes";
import todoRoutes from "./todoRoutes";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";
import attachmentRoutes from "./attachmentRoutes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/todos", attachmentRoutes); // Attachment routes: /api/todos/:id/attachments
router.use("/todos", todoRoutes);

export default router;
