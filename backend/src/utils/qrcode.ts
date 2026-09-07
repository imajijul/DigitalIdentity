import QRCode from 'qrcode';
import crypto from 'crypto';

export function generateVerificationToken(): string {
  // Generate high-entropy 32-byte hex token
  return 'tok_' + crypto.randomBytes(24).toString('hex');
}

export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function generateQrDataUrl(verifyUrl: string): Promise<string> {
  return QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}
