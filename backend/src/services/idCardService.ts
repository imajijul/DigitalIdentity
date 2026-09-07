import { idCardRepository } from '../repositories/idCardRepository';
import { studentRepository } from '../repositories/studentRepository';
import { userRepository } from '../repositories/userRepository';
import { auditRepository } from '../repositories/auditRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { withTransaction } from '../config/database';
import { generateVerificationToken, hashVerificationToken, generateQrDataUrl } from '../utils/qrcode';
import { StudentIdCard, AuthTokenPayload } from '../types/index';

export const idCardService = {
  async listCards(params: {
    instituteId?: string | null;
    studentId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    const { cards, total } = await idCardRepository.list({
      ...params,
      limit,
      offset,
    });

    return {
      cards,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getCardById(id: string, instituteId?: string | null): Promise<StudentIdCard> {
    const card = await idCardRepository.findById(id, instituteId);
    if (!card) {
      throw { status: 404, message: 'ID Card record not found.', code: 'CARD_NOT_FOUND' };
    }
    return card;
  },

  async getActiveCardForStudent(studentId: string): Promise<StudentIdCard | null> {
    return idCardRepository.findActiveByStudentId(studentId);
  },

  async generateCard(
    studentId: string,
    instituteId: string,
    theme: string = 'navy',
    userContext: AuthTokenPayload,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<StudentIdCard> {
    const student = await studentRepository.findById(studentId, instituteId);
    if (!student) {
      throw { status: 404, message: 'Student not found.', code: 'STUDENT_NOT_FOUND' };
    }

    return await withTransaction(async (client) => {
      // Revoke any existing active card for this student
      await idCardRepository.revokeAllActiveByStudentId(studentId, 'Replaced by newly generated card issuance.', client);

      const token = generateVerificationToken();
      const tokenHash = hashVerificationToken(token);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const cardNumber = `IDC-${student.student_id_number}-${randomSuffix}`;
      const verifyUrl = `/verify/${token}`;
      const qrUrl = await generateQrDataUrl(verifyUrl);

      const issueDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newCard = await idCardRepository.create({
        student_id: studentId,
        institute_id: instituteId,
        card_number: cardNumber,
        version: 1,
        issue_date: issueDate,
        expiry_date: expiryDate,
        status: 'ACTIVE',
        verification_token: token,
        verification_token_hash: tokenHash,
        theme,
        qr_url: qrUrl,
      }, client);

      await auditRepository.log({
        user_id: userContext.userId,
        institute_id: instituteId,
        action: 'CREATE_ID_CARD',
        target_type: 'student_id_cards',
        target_id: newCard.id,
        details: `Generated ID card ${newCard.card_number} (v1) for student ${student.first_name} ${student.last_name}.`,
        ip_address: meta?.ip,
        user_agent: meta?.userAgent,
      }, client);

      return newCard;
    });
  },

  /**
   * Versioning replacement operation:
   * Old card -> REVOKED
   * New card -> Version + 1 -> ACTIVE
   */
  async replaceCard(
    oldCardId: string,
    reason: string,
    instituteId: string,
    userContext: AuthTokenPayload,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<StudentIdCard> {
    const oldCard = await idCardRepository.findById(oldCardId, instituteId);
    if (!oldCard) {
      throw { status: 404, message: 'Original ID Card not found.', code: 'CARD_NOT_FOUND' };
    }

    return await withTransaction(async (client) => {
      // 1. Revoke old card
      await idCardRepository.revoke(oldCardId, reason || 'Replaced with updated digital card', client);

      // 2. Generate new token and card number
      const token = generateVerificationToken();
      const tokenHash = hashVerificationToken(token);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const cardNumber = `IDC-${oldCard.student_id_number || 'STU'}-${randomSuffix}`;
      const verifyUrl = `/verify/${token}`;
      const qrUrl = await generateQrDataUrl(verifyUrl);

      const issueDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // 3. Create new card with version + 1
      const newCard = await idCardRepository.create({
        student_id: oldCard.student_id,
        institute_id: instituteId,
        card_number: cardNumber,
        version: oldCard.version + 1,
        issue_date: issueDate,
        expiry_date: expiryDate,
        status: 'ACTIVE',
        verification_token: token,
        verification_token_hash: tokenHash,
        theme: oldCard.theme,
        qr_url: qrUrl,
      }, client);

      // 4. Audit Log
      await auditRepository.log({
        user_id: userContext.userId,
        institute_id: instituteId,
        action: 'REPLACE_ID_CARD',
        target_type: 'student_id_cards',
        target_id: newCard.id,
        details: `Replaced ID card ${oldCard.card_number} (v${oldCard.version}) with new card ${newCard.card_number} (v${newCard.version}). Reason: ${reason}`,
        ip_address: meta?.ip,
        user_agent: meta?.userAgent,
      }, client);

      // 5. Check if user exists for this student to send notification
      const studentUser = await userRepository.findByEmail(oldCard.student_id_number || '');
      if (studentUser) {
        await notificationRepository.create({
          user_id: studentUser.id,
          institute_id: instituteId,
          title: 'ID Card Replaced',
          message: `Your student digital ID card has been updated to Version ${newCard.version}. Card number: ${newCard.card_number}`,
          type: 'INFO',
        }, client);
      }

      return newCard;
    });
  },

  async revokeCard(
    cardId: string,
    reason: string,
    instituteId: string,
    userContext: AuthTokenPayload,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<StudentIdCard> {
    const card = await idCardRepository.findById(cardId, instituteId);
    if (!card) {
      throw { status: 404, message: 'ID Card not found.', code: 'CARD_NOT_FOUND' };
    }

    const revoked = await idCardRepository.revoke(cardId, reason);
    if (!revoked) {
      throw { status: 500, message: 'Failed to revoke ID card.', code: 'REVOCATION_FAILED' };
    }

    await auditRepository.log({
      user_id: userContext.userId,
      institute_id: instituteId,
      action: 'REVOKE_ID_CARD',
      target_type: 'student_id_cards',
      target_id: cardId,
      details: `Revoked ID card ${card.card_number}. Reason: ${reason}`,
      ip_address: meta?.ip,
      user_agent: meta?.userAgent,
    });

    return revoked;
  },
};

