import { Router } from 'express';
import { sessionController } from '../controllers/sessionController';
import { authenticate, requireRoles } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenant';

const router = Router();

router.use(authenticate);

router.get('/', sessionController.list);
router.post('/', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, sessionController.create);
router.put('/:id', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, sessionController.update);
router.delete('/:id', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, sessionController.delete);

export default router;

