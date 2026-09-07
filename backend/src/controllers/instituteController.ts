import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { instituteRepository } from '../repositories/instituteRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';

export const instituteController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutes = await instituteRepository.listAll();
      res.json({
        success: true,
        data: { institutes },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const institute = await instituteRepository.findById(req.params.id);
      if (!institute) {
        res.status(404).json({ success: false, message: 'Institute not found.', error: 'NOT_FOUND' });
        return;
      }
      res.json({
        success: true,
        data: { institute },
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await instituteRepository.findByCode(req.body.code);
      if (existing) {
        res.status(409).json({ success: false, message: 'Institute code already exists.', error: 'CODE_EXISTS' });
        return;
      }

      const institute = await instituteRepository.create(req.body);

      await auditRepository.log({
        user_id: req.user?.userId,
        institute_id: institute.id,
        action: 'CREATE_INSTITUTE',
        target_type: 'institutes',
        target_id: institute.id,
        details: `Created institute ${institute.name} (${institute.code}).`,
      });

      res.status(201).json({
        success: true,
        message: 'Institute created successfully.',
        data: { institute },
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const institute = await instituteRepository.update(req.params.id, req.body);
      if (!institute) {
        res.status(404).json({ success: false, message: 'Institute not found.', error: 'NOT_FOUND' });
        return;
      }

      await auditRepository.log({
        user_id: req.user?.userId,
        institute_id: institute.id,
        action: 'UPDATE_INSTITUTE',
        target_type: 'institutes',
        target_id: institute.id,
        details: `Updated institute ${institute.name}.`,
      });

      res.json({
        success: true,
        message: 'Institute details updated.',
        data: { institute },
      });
    } catch (err) {
      next(err);
    }
  },
};
