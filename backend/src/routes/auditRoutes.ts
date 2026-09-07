import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { verificationController } from '../controllers/verificationController';
import { authenticate, requireRoles } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenant';

const router = Router();

router.use(authenticate);

// Audit logs
router.get('/', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), auditController.list);

export default router;

