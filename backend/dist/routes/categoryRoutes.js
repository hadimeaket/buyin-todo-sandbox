"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All category routes require authentication
router.use(auth_1.authMiddleware);
router.get('/', categoryController_1.getAllCategories);
router.get('/:id', categoryController_1.getCategoryById);
router.post('/', categoryController_1.createCategory);
router.put('/:id', categoryController_1.updateCategory);
router.delete('/:id', categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map