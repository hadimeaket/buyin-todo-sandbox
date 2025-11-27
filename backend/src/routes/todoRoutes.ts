import { Router } from "express";
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  generateTestTodos,
  assignCategoryToAllTodos,
} from "../controllers/todoController";
import { exportTodosAsICS } from "../controllers/exportController";

const router = Router();

// GET all todos
router.get("/", getAllTodos);

// GET todo by id
router.get("/:id", getTodoById);

// POST create todo
router.post("/", createTodo);

// POST generate test todos
router.post("/generate/test", generateTestTodos);

// POST assign category to all todos
router.post("/assign-category", assignCategoryToAllTodos);

// GET export todos as ICS
router.get("/export/ics", exportTodosAsICS);

// PUT update todo
router.put("/:id", updateTodo);

// PATCH toggle todo completion
router.patch("/:id/toggle", toggleTodo);

// DELETE todo
router.delete("/:id", deleteTodo);

export default router;
