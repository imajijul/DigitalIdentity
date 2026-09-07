import { Router } from 'express';
import { statsController } from '../controllers/statsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', statsController.getDashboardStats);

export default router;

