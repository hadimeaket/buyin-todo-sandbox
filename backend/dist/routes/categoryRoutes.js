"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Alle Routes benötigen Authentifizierung
router.use(auth_1.requireAuth);
// GET /api/categories - Alle Kategorien des Nutzers
router.get("/", categoryController_1.categoryController.getAllCategories);
// GET /api/categories/:id - Einzelne Kategorie
router.get("/:id", categoryController_1.categoryController.getCategoryById);
// POST /api/categories - Neue Kategorie erstellen
router.post("/", categoryController_1.categoryController.createCategory);
// PUT /api/categories/:id - Kategorie aktualisieren
router.put("/:id", categoryController_1.categoryController.updateCategory);
// DELETE /api/categories/:id - Kategorie löschen
router.delete("/:id", categoryController_1.categoryController.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map