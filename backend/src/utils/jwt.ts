import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '../types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'digital_id_system_jwt_secret_key_2025_prod_secure';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'digital_id_system_refresh_secret_key_2025_prod_secure';

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyAccessToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (err) {
    return null;
  }
}

export function signRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as AuthTokenPayload;
  } catch (err) {
    return null;
  }
}
