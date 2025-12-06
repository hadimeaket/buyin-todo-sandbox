import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";
import { authenticate } from "../middleware/auth";

export function createCategoryRoutes(
  categoryController: CategoryController
): Router {
  const router = Router();

  // All category routes require authentication
  router.use(authenticate);

  // GET /api/categories - Get all categories for the authenticated user
  router.get("/", categoryController.getAllCategories);

  // GET /api/categories/:id - Get a specific category
  router.get("/:id", categoryController.getCategoryById);

  // POST /api/categories - Create a new category
  router.post("/", categoryController.createCategory);

  // PUT /api/categories/:id - Update a category
  router.put("/:id", categoryController.updateCategory);

  // DELETE /api/categories/:id - Delete a category
  router.delete("/:id", categoryController.deleteCategory);

  return router;
}
