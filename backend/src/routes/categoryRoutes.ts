import { Router, RequestHandler } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate as RequestHandler);

router.get("/", getAllCategories as RequestHandler);
router.get("/:id", getCategoryById as RequestHandler);
router.post("/", createCategory as RequestHandler);
router.put("/:id", updateCategory as RequestHandler);
router.delete("/:id", deleteCategory as RequestHandler);

export default router;
