import { Router } from 'express';
import healthRoutes from './healthRoutes';
import todoRoutes from './todoRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/todos', todoRoutes);

export default router;
