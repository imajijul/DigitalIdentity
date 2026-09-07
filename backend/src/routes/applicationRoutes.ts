import { Router } from 'express';
import { applicationController } from '../controllers/applicationController';
import { authenticate, requireRoles } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenant';

const router = Router();

router.use(authenticate);

router.get('/', applicationController.list);
router.post('/', applicationController.create);
router.patch('/:id/approve', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, applicationController.approve);
router.patch('/:id/reject', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, applicationController.reject);

export default router;

