import { Router } from 'express';
import authRoutes from './authRoutes';
import studentRoutes from './studentRoutes';
import teacherRoutes from './teacherRoutes';
import departmentRoutes from './departmentRoutes';
import sessionRoutes from './sessionRoutes';
import idCardRoutes from './idCardRoutes';
import verificationRoutes from './verificationRoutes';
import applicationRoutes from './applicationRoutes';
import notificationRoutes from './notificationRoutes';
import auditRoutes from './auditRoutes';
import instituteRoutes from './instituteRoutes';
import statsRoutes from './statsRoutes';
import { verificationController } from '../controllers/verificationController';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();
const unwrap = (r: any) => (r && typeof r === 'object' && r.default ? r.default : r);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', unwrap(authRoutes));
router.use('/students', unwrap(studentRoutes));
router.use('/teachers', unwrap(teacherRoutes));
router.use('/departments', unwrap(departmentRoutes));
router.use('/sessions', unwrap(sessionRoutes));
router.use('/id-cards', unwrap(idCardRoutes));
router.use('/verify', unwrap(verificationRoutes));
router.use('/verifications', unwrap(verificationRoutes));
router.use('/id-card-applications', unwrap(applicationRoutes));
router.use('/notifications', unwrap(notificationRoutes));
router.use('/audit-logs', unwrap(auditRoutes));
router.use('/institutes', unwrap(instituteRoutes));
router.use('/stats', unwrap(statsRoutes));

// Direct verification-logs route (Section 31 requirement)
router.get(
  '/verification-logs',
  authenticate,
  requireRoles('SUPER_ADMIN', 'INSTITUTE_ADMIN'),
  verificationController.listLogs
);

export default router;

