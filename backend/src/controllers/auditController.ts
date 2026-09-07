import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthorizedInstituteId } from '../middleware/tenant.ts';
import { auditRepository } from '../repositories/auditRepository.ts';

export const auditController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const result = await auditRepository.list({
        instituteId,
        action: req.query.action as string,
        limit,
        offset,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
