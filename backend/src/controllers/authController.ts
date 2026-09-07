import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.ts';
import { validateLoginInput, validateSignupInput } from '../validators/index.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isValid, errors } = validateLoginInput(req.body);
      if (!isValid) {
        res.status(422).json({
          success: false,
          message: 'Validation failed.',
          errors,
        });
        return;
      }

      const meta = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const { user, accessToken, refreshToken } = await authService.login(
        req.body.email,
        req.body.password,
        meta
      );

      // Set secure HTTP-only cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful.',
        data: {
          user,
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isValid, errors } = validateSignupInput(req.body);
      if (!isValid) {
        res.status(422).json({
          success: false,
          message: 'Validation failed.',
          errors,
        });
        return;
      }

      const { user, accessToken, refreshToken } = await authService.signup(req.body);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: {
          user,
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  },

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.', error: 'UNAUTHORIZED' });
        return;
      }
      const user = await authService.getMe(req.user.userId);
      res.json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },
};
