import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// All category routes require authentication
router.get("/", authenticate, getAllCategories);
router.get("/:id", authenticate, getCategoryById);
router.post("/", authenticate, createCategory);
router.put("/:id", authenticate, updateCategory);
router.delete("/:id", authenticate, deleteCategory);

export default router;
