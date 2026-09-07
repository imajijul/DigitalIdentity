import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { notificationRepository } from '../repositories/notificationRepository';

export const notificationController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' });
        return;
      }
      const notifications = await notificationRepository.listByUser(req.user.userId);
      res.json({
        success: true,
        data: { notifications },
      });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' });
        return;
      }
      await notificationRepository.markAsRead(req.params.id, req.user.userId);
      res.json({
        success: true,
        message: 'Notification marked as read.',
      });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' });
        return;
      }
      await notificationRepository.markAllAsRead(req.user.userId);
      res.json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (err) {
      next(err);
    }
  },
};

