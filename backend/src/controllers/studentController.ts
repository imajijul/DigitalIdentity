import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthorizedInstituteId } from '../middleware/tenant.ts';
import { studentService } from '../services/studentService.ts';
import { validateStudentInput } from '../validators/index.ts';

export const studentController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);

      // If user is a student, they can only access their own profile
      if (req.user?.role === 'STUDENT' && req.user.studentId) {
        const student = await studentService.getStudentById(req.user.studentId, instituteId);
        res.json({
          success: true,
          data: {
            students: [student],
            pagination: { total: 1, page: 1, limit: 1, totalPages: 1 },
          },
        });
        return;
      }

      const result = await studentService.listStudents({
        instituteId,
        search: req.query.search as string,
        departmentId: req.query.department_id as string,
        sessionId: req.query.session_id as string,
        status: req.query.status as string,
        semester: req.query.semester as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);

      // Check student role restriction
      if (req.user?.role === 'STUDENT') {
        if (req.user.studentId !== req.params.id) {
          res.status(403).json({
            success: false,
            message: 'You are not permitted to view other students records.',
            error: 'FORBIDDEN',
          });
          return;
        }
      }

      const student = await studentService.getStudentById(req.params.id, instituteId);
      res.json({
        success: true,
        data: { student },
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isValid, errors } = validateStudentInput(req.body);
      if (!isValid) {
        res.status(422).json({
          success: false,
          message: 'Validation failed on student inputs.',
          errors,
        });
        return;
      }

      const meta = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const student = await studentService.createStudent(req.body, req.user!, meta);
      res.status(201).json({
        success: true,
        message: 'Student created successfully with digital ID card generated.',
        data: { student },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Section 14 requirement:
   * React Form -> PUT /api/students/:id -> Express -> Auth -> RBAC ->
   * Institute Auth -> Validation -> SQL UPDATE -> PostgreSQL -> Audit Log -> Response -> React UI
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);

      const meta = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const student = await studentService.updateStudent(
        req.params.id,
        instituteId,
        req.body,
        req.user!,
        meta
      );

      res.json({
        success: true,
        message: 'Student profile updated successfully in PostgreSQL database.',
        data: { student },
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);

      const meta = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      await studentService.deleteStudent(req.params.id, instituteId, req.user!, meta);
      res.json({
        success: true,
        message: 'Student deactivated successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};
