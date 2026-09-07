import { Router } from 'express';
import { studentController } from '../controllers/studentController.ts';
import { authenticate, requireRoles } from '../middleware/auth.ts';
import { enforceTenantIsolation } from '../middleware/tenant.ts';

const router = Router();

router.use(authenticate);

// List & view students
router.get('/', studentController.list);
router.get('/:id', studentController.getById);

// Admin operations
router.post('/', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, studentController.create);
router.put('/:id', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, studentController.update);
router.patch('/:id', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, studentController.update);
router.delete('/:id', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, studentController.delete);

export default router;
