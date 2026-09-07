import { Router } from 'express';
import { auditController } from '../controllers/auditController.ts';
import { verificationController } from '../controllers/verificationController.ts';
import { authenticate, requireRoles } from '../middleware/auth.ts';
import { enforceTenantIsolation } from '../middleware/tenant.ts';

const router = Router();

router.use(authenticate);

// Audit logs
router.get('/', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), auditController.list);

export default router;
