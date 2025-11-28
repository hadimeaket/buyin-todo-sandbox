"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todoController_1 = require("../controllers/todoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.requireAuth);
// GET all todos
router.get('/', todoController_1.getAllTodos);
// GET todo by id
router.get('/:id', todoController_1.getTodoById);
// POST create todo
router.post('/', todoController_1.createTodo);
// PUT update todo
router.put('/:id', todoController_1.updateTodo);
// PATCH toggle todo completion
router.patch('/:id/toggle', todoController_1.toggleTodo);
// DELETE todo
router.delete('/:id', todoController_1.deleteTodo);
exports.default = router;
//# sourceMappingURL=todoRoutes.js.map