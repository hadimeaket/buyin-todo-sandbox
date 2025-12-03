import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

const router = Router();

// All category routes require authentication
router.use(requireAuth);

// GET /api/categories - Get all categories
router.get("/", getAllCategories);

// GET /api/categories/:id - Get category by ID
router.get("/:id", getCategoryById);

// POST /api/categories - Create new category
router.post("/", createCategory);

// PUT /api/categories/:id - Update category
router.put("/:id", updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete("/:id", deleteCategory);

export default router;
