import { Router } from 'express';
import { teacherController } from '../controllers/teacherController.ts';
import { authenticate, requireRoles } from '../middleware/auth.ts';
import { enforceTenantIsolation } from '../middleware/tenant.ts';

const router = Router();

router.use(authenticate);

router.get('/', teacherController.list);
router.get('/:id', teacherController.getById);
router.post('/', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, teacherController.create);
router.put('/:id', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, teacherController.update);
router.delete('/:id', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, teacherController.delete);

export default router;
