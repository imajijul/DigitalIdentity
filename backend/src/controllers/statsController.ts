import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getAuthorizedInstituteId } from '../middleware/tenant';
import { query } from '../config/database';

export const statsController = {
  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.user?.role;
      const instituteId = getAuthorizedInstituteId(req);

      if (role === 'SUPER_ADMIN') {
        const [instRes, userRes, stuRes, cardRes, verRes] = await Promise.all([
          query(`SELECT COUNT(*)::int AS count FROM institutes WHERE deleted_at IS NULL`),
          query(`SELECT COUNT(*)::int AS count FROM users WHERE deleted_at IS NULL`),
          query(`SELECT COUNT(*)::int AS count FROM students WHERE deleted_at IS NULL`),
          query(`SELECT COUNT(*)::int AS count FROM student_id_cards`),
          query(`SELECT COUNT(*)::int AS count FROM verification_logs`),
        ]);

        res.json({
          success: true,
          data: {
            totalInstitutes: instRes.rows[0]?.count || 0,
            totalUsers: userRes.rows[0]?.count || 0,
            totalStudents: stuRes.rows[0]?.count || 0,
            totalIdCards: cardRes.rows[0]?.count || 0,
            totalVerifications: verRes.rows[0]?.count || 0,
          },
        });
        return;
      }

      // Institute-scoped stats
      const [studentsRes, activeStuRes, teachersRes, deptRes, activeCardsRes, expiredCardsRes, pendingAppsRes, verRes] = await Promise.all([
        query(`SELECT COUNT(*)::int AS count FROM students WHERE institute_id = $1 AND deleted_at IS NULL`, [instituteId]),
        query(`SELECT COUNT(*)::int AS count FROM students WHERE institute_id = $1 AND status = 'ACTIVE' AND deleted_at IS NULL`, [instituteId]),
        query(`SELECT COUNT(*)::int AS count FROM teachers WHERE institute_id = $1`, [instituteId]),
        query(`SELECT COUNT(*)::int AS count FROM departments WHERE institute_id = $1`, [instituteId]),
        query(`SELECT COUNT(*)::int AS count FROM student_id_cards WHERE institute_id = $1 AND status = 'ACTIVE'`, [instituteId]),
        query(`SELECT COUNT(*)::int AS count FROM student_id_cards WHERE institute_id = $1 AND status = 'EXPIRED'`, [instituteId]),
        query(`SELECT COUNT(*)::int AS count FROM id_card_applications WHERE institute_id = $1 AND status = 'PENDING'`, [instituteId]),
        query(`SELECT COUNT(*)::int AS count FROM verification_logs WHERE institute_id = $1`, [instituteId]),
      ]);

      res.json({
        success: true,
        data: {
          totalStudents: studentsRes.rows[0]?.count || 0,
          activeStudents: activeStuRes.rows[0]?.count || 0,
          totalTeachers: teachersRes.rows[0]?.count || 0,
          totalDepartments: deptRes.rows[0]?.count || 0,
          activeIdCards: activeCardsRes.rows[0]?.count || 0,
          expiredIdCards: expiredCardsRes.rows[0]?.count || 0,
          pendingApplications: pendingAppsRes.rows[0]?.count || 0,
          totalVerifications: verRes.rows[0]?.count || 0,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

