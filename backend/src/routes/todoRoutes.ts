import { Router } from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from '../controllers/todoController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET all todos
router.get('/', getAllTodos);

// GET todo by id
router.get('/:id', getTodoById);

// POST create todo
router.post('/', createTodo);

// PUT update todo
router.put('/:id', updateTodo);

// PATCH toggle todo completion
router.patch('/:id/toggle', toggleTodo);

// DELETE todo
router.delete('/:id', deleteTodo);

export default router;
