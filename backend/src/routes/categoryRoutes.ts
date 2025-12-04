/**
 * Category Routes
 *
 * Defines HTTP routes for category management
 * All routes require authentication
 */

import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Apply auth middleware to all category routes
router.use(authMiddleware);

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
