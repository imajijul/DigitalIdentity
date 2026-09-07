import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const isDbAuthError =
    err.code === '28P01' ||
    err.code === 'DB_AUTH_FAILED' ||
    (err.message && typeof err.message === 'string' && err.message.includes('password authentication failed'));

  if (isDbAuthError) {
    console.error('Database Authentication Error:', err.message);
  } else {
    console.error('Unhandled Application Error:', err);
  }

  const statusCode = isDbAuthError ? 503 : (err.status || err.statusCode || 500);
  let message = err.message || 'An unexpected internal server error occurred.';
  if (isDbAuthError) {
    message =
      'PostgreSQL database password authentication failed. Please update your Neon PostgreSQL password or connection string in backend/.env or the platform settings.';
  }
  const errorCode = isDbAuthError ? 'DB_AUTH_FAILED' : (err.code || 'INTERNAL_SERVER_ERROR');

  res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
  });
}
