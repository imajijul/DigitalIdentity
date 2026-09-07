import { Request, Response, NextFunction } from 'express';
import { verificationService } from '../services/verificationService';
import { verificationRepository } from '../repositories/verificationRepository';
import { AuthenticatedRequest } from '../middleware/auth';
import { getAuthorizedInstituteId } from '../middleware/tenant';

export const verificationController = {
  /**
   * Public QR Verification Endpoint (Section 21)
   * Accessible by anyone scanning QR code without login.
   * Returns safe non-sensitive data only.
   */
  async verifyPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.params.token;
      const meta = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        deviceType: req.headers['sec-ch-ua-platform'] ? String(req.headers['sec-ch-ua-platform']).replace(/"/g, '') : 'Web Client',
      };

      const result = await verificationService.verifyByToken(token, meta);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  async listLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instituteId = getAuthorizedInstituteId(req);
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

      const result = await verificationRepository.list({
        instituteId,
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

