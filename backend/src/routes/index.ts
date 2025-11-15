import { Router } from 'express';
import healthRoutes from './healthRoutes';
import todoRoutes from './todoRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/todos', todoRoutes);

export default router;
