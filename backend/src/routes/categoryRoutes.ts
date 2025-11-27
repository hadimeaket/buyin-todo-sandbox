import { Router } from "express";
import categoryController from "../controllers/categoryController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All category routes require authentication
router.use(authMiddleware);

router.get("/", (req, res) => categoryController.getAllCategories(req, res));
router.get("/:id", (req, res) => categoryController.getCategoryById(req, res));
router.post("/", (req, res) => categoryController.createCategory(req, res));
router.put("/:id", (req, res) => categoryController.updateCategory(req, res));
router.delete("/:id", (req, res) =>
  categoryController.deleteCategory(req, res)
);

export default router;
