import { idCardRepository } from '../repositories/idCardRepository.ts';
import { verificationRepository } from '../repositories/verificationRepository.ts';
import { VerificationResult } from '../types/index.ts';

export interface SafePublicVerificationResponse {
  isValid: boolean;
  verificationResult: VerificationResult;
  verificationMessage: string;
  studentName?: string;
  studentIdNumber?: string;
  instituteName?: string;
  instituteLogoUrl?: string;
  departmentName?: string;
  sessionName?: string;
  currentSemester?: string;
  bloodGroup?: string;
  photoUrl?: string;
  cardNumber?: string;
  cardVersion?: number;
  cardStatus?: string;
  issueDate?: string;
  expiryDate?: string;
  verifiedAt: string;
}

export const verificationService = {
  async verifyByToken(
    token: string,
    meta?: { ip?: string; userAgent?: string; deviceType?: string; location?: string }
  ): Promise<SafePublicVerificationResponse> {
    const verifiedAt = new Date().toISOString();

    if (!token || token.trim().length === 0) {
      await verificationRepository.log({
        token_identifier: token || 'empty',
        verification_result: 'INVALID',
        is_suspicious: true,
        ip_address: meta?.ip,
        user_agent: meta?.userAgent,
      });

      return {
        isValid: false,
        verificationResult: 'INVALID',
        verificationMessage: 'Invalid verification token requested.',
        verifiedAt,
      };
    }

    const card = await idCardRepository.findByVerificationToken(token.trim());

    if (!card) {
      await verificationRepository.log({
        token_identifier: token.trim(),
        verification_result: 'INVALID',
        is_suspicious: false,
        ip_address: meta?.ip,
        user_agent: meta?.userAgent,
        device_type: meta?.deviceType,
      });

      return {
        isValid: false,
        verificationResult: 'INVALID',
        verificationMessage: 'This QR code verification token does not match any record in the institutional registry.',
        verifiedAt,
      };
    }

    // Check expiry
    const now = new Date();
    const expiry = new Date(card.expiry_date);
    const isExpired = expiry < now;

    let result: VerificationResult = 'VALID';
    let message = 'Student digital ID card is authentic, active, and verified.';

    if (card.status === 'REVOKED') {
      result = 'REVOKED';
      message = `This ID card was revoked on ${card.revoked_at ? new Date(card.revoked_at).toLocaleDateString() : 'earlier date'}.`;
    } else if (card.status === 'SUSPENDED') {
      result = 'REVOKED';
      message = 'This ID card has been suspended by the institution administration.';
    } else if (isExpired || card.status === 'EXPIRED') {
      result = 'EXPIRED';
      message = `This ID card expired on ${new Date(card.expiry_date).toLocaleDateString()}.`;
    }

    // Log verification
    await verificationRepository.log({
      student_id: card.student_id,
      card_id: card.id,
      institute_id: card.institute_id,
      token_identifier: token,
      verification_result: result,
      is_suspicious: result === 'REVOKED',
      ip_address: meta?.ip,
      user_agent: meta?.userAgent,
      device_type: meta?.deviceType,
      location: meta?.location,
      metadata: {
        card_number: card.card_number,
        version: card.version,
      },
    });

    // Return strictly sanitized public fields (Section 21)
    return {
      isValid: result === 'VALID',
      verificationResult: result,
      verificationMessage: message,
      studentName: card.student_name,
      studentIdNumber: card.student_id_number,
      instituteName: card.institute_name,
      instituteLogoUrl: card.institute_logo_url,
      departmentName: card.department_name,
      sessionName: card.session_name,
      currentSemester: card.current_semester,
      bloodGroup: card.blood_group,
      photoUrl: card.photo_url,
      cardNumber: card.card_number,
      cardVersion: card.version,
      cardStatus: card.status,
      issueDate: card.issue_date,
      expiryDate: card.expiry_date,
      verifiedAt,
    };
  },
};
