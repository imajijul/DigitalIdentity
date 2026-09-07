import { Router } from 'express';
import { departmentController } from '../controllers/departmentController.ts';
import { authenticate, requireRoles } from '../middleware/auth.ts';
import { enforceTenantIsolation } from '../middleware/tenant.ts';

const router = Router();

router.use(authenticate);

router.get('/', departmentController.list);
router.get('/:id', departmentController.getById);
router.post('/', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, departmentController.create);
router.put('/:id', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, departmentController.update);
router.delete('/:id', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, departmentController.delete);

export default router;
