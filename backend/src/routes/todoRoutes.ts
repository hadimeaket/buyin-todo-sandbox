import { Router, RequestHandler } from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} from '../controllers/todoController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate as RequestHandler);

// GET all todos
router.get('/', getAllTodos as RequestHandler);

// GET todo by id
router.get('/:id', getTodoById as RequestHandler);

// POST create todo
router.post('/', createTodo as RequestHandler);

// PUT update todo
router.put('/:id', updateTodo as RequestHandler);

// PATCH toggle todo completion
router.patch('/:id/toggle', toggleTodo as RequestHandler);

// DELETE todo
router.delete('/:id', deleteTodo as RequestHandler);

export default router;
