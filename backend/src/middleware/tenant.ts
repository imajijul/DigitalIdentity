import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.ts';

/**
 * Resolves the authenticated user's instituteId.
 * For non-SUPER_ADMIN users, strictly overrides any frontend-supplied institute_id.
 */
export function getAuthorizedInstituteId(req: AuthenticatedRequest): string | null {
  if (!req.user) return null;

  // SUPER_ADMIN can optionally inspect any institute if requested, or query all
  if (req.user.role === 'SUPER_ADMIN') {
    return (req.query.institute_id as string) || (req.body.institute_id as string) || null;
  }

  // All other roles strictly use their own institute
  return req.user.instituteId;
}

/**
 * Middleware ensuring non-super-admins cannot touch resources outside their institute.
 */
export function enforceTenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' });
    return;
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!req.user.instituteId) {
    res.status(403).json({
      success: false,
      message: 'Account is not associated with any educational institute.',
      error: 'NO_INSTITUTE_ASSOCIATION',
    });
    return;
  }

  next();
}
