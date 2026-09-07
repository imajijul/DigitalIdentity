import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getAuthorizedInstituteId } from '../middleware/tenant.ts';
import { idCardService } from '../services/idCardService.ts';

export const idCardController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);

      // Student can only see their own cards
      let targetStudentId: string | undefined = req.query.student_id as string;
      if (req.user?.role === 'STUDENT') {
        if (!req.user.studentId) {
          res.json({
            success: true,
            data: { cards: [], total: 0, page: 1, limit: 20 },
          });
          return;
        }
        targetStudentId = req.user.studentId;
      }

      const result = await idCardService.listCards({
        instituteId,
        studentId: targetStudentId || undefined,
        status: req.query.status as string,
        search: req.query.search as string,
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
      const card = await idCardService.getCardById(req.params.id, instituteId);

      // Student isolation
      if (req.user?.role === 'STUDENT' && req.user.studentId !== card.student_id) {
        res.status(403).json({ success: false, message: 'Forbidden', error: 'FORBIDDEN' });
        return;
      }

      res.json({
        success: true,
        data: { card },
      });
    } catch (err) {
      next(err);
    }
  },

  async getMyActiveCard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.studentId) {
        res.json({
          success: true,
          data: {
            card: null,
            message: 'No student record associated with this account.',
          },
        });
        return;
      }

      const card = await idCardService.getActiveCardForStudent(req.user.studentId);
      if (!card) {
        res.json({
          success: true,
          data: {
            card: null,
            message: 'No active digital ID card found. Please submit an issuance application.',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { card },
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

      const meta = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const card = await idCardService.generateCard(
        req.body.student_id,
        instituteId,
        req.body.theme || 'navy',
        req.user!,
        meta
      );

      res.status(201).json({
        success: true,
        message: 'Digital ID card generated successfully.',
        data: { card },
      });
    } catch (err) {
      next(err);
    }
  },

  async replace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      if (!instituteId) {
        res.status(400).json({ success: false, message: 'Institute ID is required.', error: 'MISSING_INSTITUTE' });
        return;
      }

      const meta = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const card = await idCardService.replaceCard(
        req.params.id,
        req.body.reason || 'Requested card reissue',
        instituteId,
        req.user!,
        meta
      );

      res.json({
        success: true,
        message: `ID Card successfully replaced and version incremented to v${card.version}.`,
        data: { card },
      });
    } catch (err) {
      next(err);
    }
  },

  async revoke(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      if (!instituteId) {
        res.status(400).json({ success: false, message: 'Institute ID is required.', error: 'MISSING_INSTITUTE' });
        return;
      }

      const meta = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const card = await idCardService.revokeCard(
        req.params.id,
        req.body.reason || 'Administrative revocation',
        instituteId,
        req.user!,
        meta
      );

      res.json({
        success: true,
        message: 'Digital ID card revoked successfully.',
        data: { card },
      });
    } catch (err) {
      next(err);
    }
  },
};
