import { Router } from 'express';
import { statsController } from '../controllers/statsController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate);

router.get('/dashboard', statsController.getDashboardStats);

export default router;
