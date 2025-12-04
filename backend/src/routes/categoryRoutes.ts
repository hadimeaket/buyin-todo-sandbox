import { Router } from "express";
import { categoryController } from "../controllers/categoryController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Alle Routes benötigen Authentifizierung
router.use(requireAuth);

// GET /api/categories - Alle Kategorien des Nutzers
router.get("/", categoryController.getAllCategories);

// GET /api/categories/:id - Einzelne Kategorie
router.get("/:id", categoryController.getCategoryById);

// POST /api/categories - Neue Kategorie erstellen
router.post("/", categoryController.createCategory);

// PUT /api/categories/:id - Kategorie aktualisieren
router.put("/:id", categoryController.updateCategory);

// DELETE /api/categories/:id - Kategorie löschen
router.delete("/:id", categoryController.deleteCategory);

export default router;
