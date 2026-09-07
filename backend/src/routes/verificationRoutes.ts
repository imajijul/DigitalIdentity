import { Router } from 'express';
import { verificationController } from '../controllers/verificationController.ts';
import { authenticate, requireRoles } from '../middleware/auth.ts';

const router = Router();

// Public endpoint for QR scanning
router.get('/:token', verificationController.verifyPublic);
router.get('/verify/:token', verificationController.verifyPublic);

export default router;
