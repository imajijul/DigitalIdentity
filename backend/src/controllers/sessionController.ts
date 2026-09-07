import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthorizedInstituteId } from '../middleware/tenant.ts';
import { sessionRepository } from '../repositories/sessionRepository.ts';

export const sessionController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      if (!instituteId) {
        res.json({ success: true, data: { sessions: [] } });
        return;
      }
      const sessions = await sessionRepository.listByInstitute(instituteId);
      res.json({
        success: true,
        data: { sessions },
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

      const session = await sessionRepository.create({
        ...req.body,
        institute_id: instituteId,
      });

      res.status(201).json({
        success: true,
        message: 'Academic session created successfully.',
        data: { session },
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

      const session = await sessionRepository.update(req.params.id, instituteId, req.body);
      if (!session) {
        res.status(404).json({ success: false, message: 'Session not found.', error: 'SESSION_NOT_FOUND' });
        return;
      }

      res.json({
        success: true,
        message: 'Session updated successfully.',
        data: { session },
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

      await sessionRepository.delete(req.params.id, instituteId);
      res.json({
        success: true,
        message: 'Session deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};
