import { Router } from 'express';
import { idCardController } from '../controllers/idCardController.ts';
import { authenticate, requireRoles } from '../middleware/auth.ts';
import { enforceTenantIsolation } from '../middleware/tenant.ts';

const router = Router();

router.use(authenticate);

router.get('/', idCardController.list);
router.get('/my-card', idCardController.getMyActiveCard);
router.get('/student/active', idCardController.getMyActiveCard);
router.get('/:id', idCardController.getById);
router.post('/', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, idCardController.create);
router.post('/:id/replace', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, idCardController.replace);
router.post('/:id/revoke', requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'), enforceTenantIsolation, idCardController.revoke);

export default router;
