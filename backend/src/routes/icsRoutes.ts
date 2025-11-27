import { Router } from "express";
import * as icsController from "../controllers/icsController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/export", authMiddleware, icsController.exportICS);

export default router;
