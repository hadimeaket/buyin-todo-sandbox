import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All category routes require authentication
router.use(authenticate);

// GET all categories
router.get('/', getAllCategories);

// GET category by id
router.get('/:id', getCategoryById);

// POST create category
router.post('/', createCategory);

// PUT update category
router.put('/:id', updateCategory);

// DELETE category
router.delete('/:id', deleteCategory);

export default router;
