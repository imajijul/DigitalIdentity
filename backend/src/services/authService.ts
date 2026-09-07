import { userRepository } from '../repositories/userRepository.ts';
import { auditRepository } from '../repositories/auditRepository.ts';
import { studentRepository } from '../repositories/studentRepository.ts';
import { query } from '../config/database.ts';
import { hashPassword, comparePassword } from '../utils/password.ts';
import { signAccessToken, signRefreshToken } from '../utils/jwt.ts';
import { User, AuthTokenPayload } from '../types/index.ts';

export const authService = {
  async login(
    email: string,
    pass: string,
    meta?: { ip?: string; userAgent?: string }
  ): Promise<{
    user: Omit<User, 'password_hash'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Invalid email or password credentials.', code: 'INVALID_CREDENTIALS' };
    }

    if (user.status !== 'ACTIVE') {
      throw { status: 403, message: 'Account has been deactivated or suspended.', code: 'ACCOUNT_SUSPENDED' };
    }

    const isValid = await comparePassword(pass, user.password_hash);
    if (!isValid) {
      throw { status: 401, message: 'Invalid email or password credentials.', code: 'INVALID_CREDENTIALS' };
    }

    await userRepository.updateLastLogin(user.id);

    // Auto-link student record if user is a student and student_id is missing
    if (user.role === 'STUDENT' && !user.student_id && user.institute_id) {
      try {
        const studentRes = await query(
          `SELECT id FROM students WHERE institute_id = $1 AND LOWER(email) = LOWER($2) AND deleted_at IS NULL LIMIT 1`,
          [user.institute_id, user.email]
        );
        if (studentRes.rows[0]?.id) {
          user.student_id = studentRes.rows[0].id;
          await query(`UPDATE users SET student_id = $1 WHERE id = $2`, [user.student_id, user.id]);
        } else {
          const nameParts = (user.full_name || 'Student').trim().split(/\s+/);
          const firstName = nameParts[0] || 'Student';
          const lastName = nameParts.slice(1).join(' ') || 'User';
          const stuNum = `STU-${Math.floor(100000 + Math.random() * 900000)}`;
          const newStu = await studentRepository.create({
            institute_id: user.institute_id,
            student_id_number: stuNum,
            first_name: firstName,
            last_name: lastName,
            email: user.email,
          });
          if (newStu?.id) {
            user.student_id = newStu.id;
            await query(`UPDATE users SET student_id = $1 WHERE id = $2`, [user.student_id, user.id]);
          }
        }
      } catch (err: any) {
        console.warn('Could not auto-link student profile on login:', err.message);
      }
    }

    await auditRepository.log({
      user_id: user.id,
      institute_id: user.institute_id,
      action: 'LOGIN',
      target_type: 'users',
      target_id: user.id,
      details: `User ${user.email} (${user.role}) logged in successfully.`,
      ip_address: meta?.ip,
      user_agent: meta?.userAgent,
    });

    const tokenPayload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      instituteId: user.institute_id,
      studentId: user.student_id,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const { password_hash, ...safeUser } = user;
    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  },

  async signup(data: {
    full_name: string;
    email: string;
    password: string;
    institute_id?: string;
  }): Promise<{ user: Omit<User, 'password_hash'>; accessToken: string; refreshToken: string }> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw { status: 409, message: 'An account with this email address already exists.', code: 'EMAIL_CONFLICT' };
    }

    let linkedStudentId: string | null = null;
    if (data.institute_id) {
      try {
        const studentRes = await query(
          `SELECT id FROM students WHERE institute_id = $1 AND LOWER(email) = LOWER($2) AND deleted_at IS NULL LIMIT 1`,
          [data.institute_id, data.email]
        );
        if (studentRes.rows[0]?.id) {
          linkedStudentId = studentRes.rows[0].id;
        } else {
          const nameParts = (data.full_name || 'Student').trim().split(/\s+/);
          const firstName = nameParts[0] || 'Student';
          const lastName = nameParts.slice(1).join(' ') || 'User';
          const stuNum = `STU-${Math.floor(100000 + Math.random() * 900000)}`;
          const newStu = await studentRepository.create({
            institute_id: data.institute_id,
            student_id_number: stuNum,
            first_name: firstName,
            last_name: lastName,
            email: data.email,
          });
          if (newStu?.id) {
            linkedStudentId = newStu.id;
          }
        }
      } catch (err: any) {
        console.warn('Could not auto-provision student record on signup:', err.message);
      }
    }

    const hashedPassword = await hashPassword(data.password);
    // Public signup strictly creates STUDENT accounts (Section 25)
    const user = await userRepository.create({
      full_name: data.full_name,
      email: data.email,
      password_hash: hashedPassword,
      role: 'STUDENT',
      institute_id: data.institute_id || null,
      student_id: linkedStudentId,
    });

    const tokenPayload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      instituteId: user.institute_id,
      studentId: user.student_id,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const { password_hash, ...safeUser } = user;
    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  },

  async getMe(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User account not found.', code: 'USER_NOT_FOUND' };
    }
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },
};
