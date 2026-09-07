import { studentRepository } from '../repositories/studentRepository';
import { auditRepository } from '../repositories/auditRepository';
import { idCardRepository } from '../repositories/idCardRepository';
import { withTransaction } from '../config/database';
import { generateVerificationToken, hashVerificationToken, generateQrDataUrl } from '../utils/qrcode';
import { Student, AuthTokenPayload } from '../types/index';

export const studentService = {
  async listStudents(params: {
    instituteId?: string | null;
    search?: string;
    departmentId?: string;
    sessionId?: string;
    status?: string;
    semester?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    const { students, total } = await studentRepository.list({
      ...params,
      limit,
      offset,
    });

    return {
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getStudentById(id: string, instituteId?: string | null): Promise<Student> {
    const student = await studentRepository.findById(id, instituteId);
    if (!student) {
      throw { status: 404, message: 'Student record not found.', code: 'STUDENT_NOT_FOUND' };
    }
    return student;
  },

  async createStudent(
    data: any,
    userContext: AuthTokenPayload,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<Student> {
    // Resolve institute: must belong to user's institute if not SUPER_ADMIN
    const targetInstituteId = userContext.role === 'SUPER_ADMIN' ? (data.institute_id || userContext.instituteId) : userContext.instituteId;
    if (!targetInstituteId) {
      throw { status: 400, message: 'Institute ID is required.', code: 'MISSING_INSTITUTE' };
    }

    // Generate unique student ID number if not provided
    let studentIdNumber = data.student_id_number;
    if (!studentIdNumber) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      studentIdNumber = `STU-${new Date().getFullYear()}-${randomDigits}`;
    }

    // Check duplicate
    const existing = await studentRepository.findByStudentIdNumber(targetInstituteId, studentIdNumber);
    if (existing) {
      throw { status: 409, message: `Student ID Number ${studentIdNumber} is already in use in this institute.`, code: 'STUDENT_ID_CONFLICT' };
    }

    return await withTransaction(async (client) => {
      const student = await studentRepository.create({
        ...data,
        institute_id: targetInstituteId,
        student_id_number: studentIdNumber,
      }, client);

      // Auto-generate initial digital ID card
      const token = generateVerificationToken();
      const tokenHash = hashVerificationToken(token);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const cardNumber = `IDC-${student.student_id_number}-${randomSuffix}`;
      const verifyUrl = `/verify/${token}`;
      const qrUrl = await generateQrDataUrl(verifyUrl);

      const issueDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await idCardRepository.create({
        student_id: student.id,
        institute_id: targetInstituteId,
        card_number: cardNumber,
        version: 1,
        issue_date: issueDate,
        expiry_date: expiryDate,
        status: 'ACTIVE',
        verification_token: token,
        verification_token_hash: tokenHash,
        theme: data.theme || 'navy',
        qr_url: qrUrl,
      }, client);

      // Create audit log
      await auditRepository.log({
        user_id: userContext.userId,
        institute_id: targetInstituteId,
        action: 'CREATE_STUDENT',
        target_type: 'students',
        target_id: student.id,
        details: `Created student ${student.first_name} ${student.last_name} (${student.student_id_number}) and generated initial digital ID card.`,
        ip_address: meta?.ip,
        user_agent: meta?.userAgent,
      }, client);

      return student;
    });
  },

  /**
   * Safe UPDATE operation persisting to PostgreSQL with audit log.
   */
  async updateStudent(
    id: string,
    instituteId: string | null,
    data: Partial<Student>,
    userContext: AuthTokenPayload,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<Student> {
    const existing = await studentRepository.findById(id, instituteId);
    if (!existing) {
      throw { status: 404, message: 'Student not found.', code: 'STUDENT_NOT_FOUND' };
    }

    const updated = await studentRepository.update(id, instituteId, data);
    if (!updated) {
      throw { status: 500, message: 'Failed to update student in database.', code: 'UPDATE_FAILED' };
    }

    // Log the change
    await auditRepository.log({
      user_id: userContext.userId,
      institute_id: instituteId || existing.institute_id,
      action: 'UPDATE_STUDENT',
      target_type: 'students',
      target_id: id,
      details: `Updated details for student ${updated.first_name} ${updated.last_name} (${updated.student_id_number}).`,
      ip_address: meta?.ip,
      user_agent: meta?.userAgent,
    });

    return updated;
  },

  async deleteStudent(
    id: string,
    instituteId: string | null,
    userContext: AuthTokenPayload,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await studentRepository.findById(id, instituteId);
    if (!existing) {
      throw { status: 404, message: 'Student not found.', code: 'STUDENT_NOT_FOUND' };
    }

    await studentRepository.softDelete(id, instituteId);

    await auditRepository.log({
      user_id: userContext.userId,
      institute_id: instituteId || existing.institute_id,
      action: 'DELETE_STUDENT',
      target_type: 'students',
      target_id: id,
      details: `Deactivated student ${existing.first_name} ${existing.last_name} (${existing.student_id_number}).`,
      ip_address: meta?.ip,
      user_agent: meta?.userAgent,
    });
  },
};

