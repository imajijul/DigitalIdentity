import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);

export default router;
