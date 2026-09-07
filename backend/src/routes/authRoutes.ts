import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
