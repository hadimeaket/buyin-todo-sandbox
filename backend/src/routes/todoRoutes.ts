import { Router } from "express";
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from "../controllers/todoController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// GET all todos
router.get("/", authenticate, getAllTodos);

// GET todo by id
router.get("/:id", authenticate, getTodoById);

// POST create todo
router.post("/", authenticate, createTodo);

// PUT update todo
router.put("/:id", authenticate, updateTodo);

// PATCH toggle todo completion
router.patch("/:id/toggle", authenticate, toggleTodo);

// DELETE todo
router.delete("/:id", authenticate, deleteTodo);

export default router;
