import { Router } from "express";
import healthRoutes from "./healthRoutes";
import todoRoutes from "./todoRoutes";
import authRoutes from "./authRoutes";
import categoryRoutes from "./categoryRoutes";
import attachmentRoutes from "./attachmentRoutes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/todos", todoRoutes);
router.use("/categories", categoryRoutes);
router.use("/", attachmentRoutes); // Attachment routes include both /todos/:todoId/attachments and /attachments/:id

export default router;
