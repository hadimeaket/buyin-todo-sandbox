import { Router } from 'express';
import healthRoutes from './healthRoutes';
import todoRoutes from './todoRoutes';
import authRoutes from './authRoutes';
import { createCategoryRoutes } from './categoryRoutes';
import { createAttachmentRoutes } from './attachmentRoutes';
import { CategoryController } from '../controllers/categoryController';
import { CategoryService } from '../services/CategoryService';
import { SQLiteCategoryRepository } from '../repositories/CategoryRepository';
import { AttachmentService } from '../services/AttachmentService';
import { SqliteAttachmentRepository } from '../repositories/AttachmentRepository';

export function createRoutes(db: any): Router {
  const router = Router();

  // Initialize category dependencies
  const categoryRepository = new SQLiteCategoryRepository(db);
  const categoryService = new CategoryService(categoryRepository);
  const categoryController = new CategoryController(categoryService);
  const categoryRoutes = createCategoryRoutes(categoryController);

  // Initialize attachment dependencies
  const attachmentRepository = new SqliteAttachmentRepository(db);
  const attachmentService = new AttachmentService(attachmentRepository);
  const attachmentRoutes = createAttachmentRoutes(attachmentService);

  router.use('/health', healthRoutes);
  router.use('/auth', authRoutes);
  router.use('/todos', todoRoutes);
  router.use('/categories', categoryRoutes);
  router.use('/attachments', attachmentRoutes);

  return router;
}

export default createRoutes;
