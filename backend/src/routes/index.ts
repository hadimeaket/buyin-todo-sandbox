import { Router } from "express";
import healthRoutes from "./healthRoutes";
import todoRoutes from "./todoRoutes";
import categoryRoutes from "./categoryRoutes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/todos", todoRoutes);
router.use("/categories", categoryRoutes);

export default router;
