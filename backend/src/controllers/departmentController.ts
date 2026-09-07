import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getAuthorizedInstituteId } from '../middleware/tenant';
import { departmentRepository } from '../repositories/departmentRepository';
import { auditRepository } from '../repositories/auditRepository';

export const departmentController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      if (!instituteId) {
        res.json({ success: true, data: { departments: [] } });
        return;
      }
      const departments = await departmentRepository.listByInstitute(instituteId);
      res.json({
        success: true,
        data: { departments },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dept = await departmentRepository.findById(req.params.id);
      if (!dept) {
        res.status(404).json({ success: false, message: 'Department not found.', error: 'DEPARTMENT_NOT_FOUND' });
        return;
      }
      res.json({
        success: true,
        data: { department: dept },
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

      const existing = await departmentRepository.findByCode(instituteId, req.body.code);
      if (existing) {
        res.status(409).json({
          success: false,
          message: `Department code ${req.body.code} already exists in this institute.`,
          error: 'DEPARTMENT_CODE_CONFLICT',
        });
        return;
      }

      const dept = await departmentRepository.create({
        ...req.body,
        institute_id: instituteId,
      });

      await auditRepository.log({
        user_id: req.user!.userId,
        institute_id: instituteId,
        action: 'CREATE_DEPARTMENT',
        target_type: 'departments',
        target_id: dept.id,
        details: `Created department ${dept.name} (${dept.code}).`,
      });

      res.status(201).json({
        success: true,
        message: 'Department created successfully.',
        data: { department: dept },
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      if (!instituteId) {
        res.status(400).json({ success: false, message: 'Institute ID is required.', error: 'MISSING_INSTITUTE' });
        return;
      }

      const dept = await departmentRepository.update(req.params.id, instituteId, req.body);
      if (!dept) {
        res.status(404).json({ success: false, message: 'Department not found.', error: 'DEPARTMENT_NOT_FOUND' });
        return;
      }

      res.json({
        success: true,
        message: 'Department updated successfully.',
        data: { department: dept },
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      if (!instituteId) {
        res.status(400).json({ success: false, message: 'Institute ID is required.', error: 'MISSING_INSTITUTE' });
        return;
      }

      await departmentRepository.delete(req.params.id, instituteId);
      res.json({
        success: true,
        message: 'Department deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};

