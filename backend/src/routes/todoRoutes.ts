import { Router } from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from '../controllers/todoController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Alle TODO-Routes benötigen Authentication
router.use(authMiddleware);

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
