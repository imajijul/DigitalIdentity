import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthorizedInstituteId } from '../middleware/tenant.ts';
import { applicationRepository } from '../repositories/applicationRepository.ts';
import { studentRepository } from '../repositories/studentRepository.ts';
import { idCardService } from '../services/idCardService.ts';
import { notificationRepository } from '../repositories/notificationRepository.ts';
import { userRepository } from '../repositories/userRepository.ts';

export const applicationController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);

      let targetStudentId: string | undefined = req.query.student_id as string;
      if (req.user?.role === 'STUDENT') {
        if (!req.user.studentId) {
          res.json({
            success: true,
            data: { applications: [], total: 0 },
          });
          return;
        }
        targetStudentId = req.user.studentId;
      }

      const result = await applicationRepository.list({
        instituteId,
        studentId: targetStudentId || undefined,
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      let studentId = req.body.student_id;

      if (req.user?.role === 'STUDENT') {
        studentId = req.user.studentId;
      }

      if (!studentId) {
        res.status(400).json({ success: false, message: 'Student ID is required.', error: 'MISSING_STUDENT' });
        return;
      }

      const student = await studentRepository.findById(studentId);
      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found.', error: 'STUDENT_NOT_FOUND' });
        return;
      }

      const app = await applicationRepository.create({
        student_id: studentId,
        institute_id: instituteId || student.institute_id,
        application_type: req.body.application_type || 'NEW',
        reason: req.body.reason,
      });

      res.status(201).json({
        success: true,
        message: 'ID Card Application submitted successfully.',
        data: { application: app },
      });
    } catch (err) {
      next(err);
    }
  },

  async approve(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      const app = await applicationRepository.findById(req.params.id, instituteId);
      if (!app) {
        res.status(404).json({ success: false, message: 'Application not found.', error: 'APP_NOT_FOUND' });
        return;
      }

      const updated = await applicationRepository.updateStatus(app.id, 'APPROVED', req.user!.userId);

      // Issue or replace ID card
      if (app.application_type === 'REPLACEMENT') {
        const activeCard = await idCardService.getActiveCardForStudent(app.student_id);
        if (activeCard) {
          await idCardService.replaceCard(activeCard.id, app.reason || 'Approved replacement application', app.institute_id, req.user!);
        } else {
          await idCardService.generateCard(app.student_id, app.institute_id, 'navy', req.user!);
        }
      } else {
        await idCardService.generateCard(app.student_id, app.institute_id, 'navy', req.user!);
      }

      // Notify student
      const user = await userRepository.findByEmail(app.student_id_number || '');
      if (user) {
        await notificationRepository.create({
          user_id: user.id,
          institute_id: app.institute_id,
          title: 'ID Card Application Approved',
          message: 'Your student digital ID card application has been approved and your card is now active!',
          type: 'SUCCESS',
        });
      }

      res.json({
        success: true,
        message: 'Application approved and digital ID card generated.',
        data: { application: updated },
      });
    } catch (err) {
      next(err);
    }
  },

  async reject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      const app = await applicationRepository.findById(req.params.id, instituteId);
      if (!app) {
        res.status(404).json({ success: false, message: 'Application not found.', error: 'APP_NOT_FOUND' });
        return;
      }

      const updated = await applicationRepository.updateStatus(app.id, 'REJECTED', req.user!.userId);

      res.json({
        success: true,
        message: 'Application marked as rejected.',
        data: { application: updated },
      });
    } catch (err) {
      next(err);
    }
  },
};
