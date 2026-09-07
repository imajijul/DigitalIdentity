import { Router } from 'express';
import { instituteController } from '../controllers/instituteController.ts';
import { authenticate, requireRoles } from '../middleware/auth.ts';

const router = Router();

// Publicly readable or authenticated
router.get('/', instituteController.list);
router.get('/:id', instituteController.getById);

// Super admin management
router.post('/', authenticate, requireRoles('SUPER_ADMIN'), instituteController.create);
router.put('/:id', authenticate, requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), instituteController.update);

export default router;
