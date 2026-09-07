import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthorizedInstituteId } from '../middleware/tenant.ts';
import { teacherRepository } from '../repositories/teacherRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';

export const teacherController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      const teachers = await teacherRepository.listByInstitute(instituteId);
      res.json({
        success: true,
        data: { teachers },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      const teacher = await teacherRepository.findById(req.params.id, instituteId);
      if (!teacher) {
        res.status(404).json({ success: false, message: 'Teacher not found.', error: 'TEACHER_NOT_FOUND' });
        return;
      }
      res.json({
        success: true,
        data: { teacher },
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      if (!instituteId) {
        res.status(400).json({ success: false, message: 'Institute ID is required.', error: 'MISSING_INSTITUTE' });
        return;
      }

      const teacher = await teacherRepository.create({
        ...req.body,
        institute_id: instituteId,
      });

      await auditRepository.log({
        user_id: req.user!.userId,
        institute_id: instituteId,
        action: 'CREATE_TEACHER',
        target_type: 'teachers',
        target_id: teacher.id,
        details: `Added teacher ${teacher.first_name} ${teacher.last_name} (${teacher.employee_id}).`,
      });

      res.status(201).json({
        success: true,
        message: 'Teacher added successfully.',
        data: { teacher },
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      const teacher = await teacherRepository.update(req.params.id, instituteId, req.body);
      if (!teacher) {
        res.status(404).json({ success: false, message: 'Teacher not found.', error: 'TEACHER_NOT_FOUND' });
        return;
      }

      await auditRepository.log({
        user_id: req.user!.userId,
        institute_id: instituteId,
        action: 'UPDATE_TEACHER',
        target_type: 'teachers',
        target_id: teacher.id,
        details: `Updated teacher ${teacher.first_name} ${teacher.last_name}.`,
      });

      res.json({
        success: true,
        message: 'Teacher updated successfully.',
        data: { teacher },
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      await teacherRepository.delete(req.params.id, instituteId);
      res.json({
        success: true,
        message: 'Teacher removed successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};
