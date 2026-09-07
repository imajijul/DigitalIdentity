import { query } from '../config/database.ts';
import { User, UserRole } from '../types/index.ts';

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const res = await query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL LIMIT 1`,
      [email]
    );
    return res.rows[0] || null;
  },

  async findById(id: string): Promise<User | null> {
    const res = await query(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async create(user: {
    full_name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    institute_id?: string | null;
    student_id?: string | null;
    department_id?: string | null;
    avatar_url?: string | null;
  }): Promise<User> {
    const res = await query(
      `INSERT INTO users (
        full_name, email, password_hash, role, institute_id, student_id, department_id, avatar_url, email_verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *`,
      [
        user.full_name,
        user.email,
        user.password_hash,
        user.role,
        user.institute_id || null,
        user.student_id || null,
        user.department_id || null,
        user.avatar_url || null,
      ]
    );
    return res.rows[0];
  },

  async updateLastLogin(id: string): Promise<void> {
    await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [id]);
  },

  async update(id: string, fields: Partial<User>): Promise<User | null> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(fields)) {
      if (['full_name', 'avatar_url', 'department_id', 'status', 'password_hash'].includes(key)) {
        sets.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
    }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = NOW()`);
    values.push(id);

    const res = await query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  async list(instituteId?: string | null): Promise<User[]> {
    if (instituteId) {
      const res = await query(
        `SELECT id, full_name, email, role, status, institute_id, student_id, department_id, avatar_url, last_login_at, created_at
         FROM users WHERE institute_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
        [instituteId]
      );
      return res.rows;
    }
    const res = await query(
      `SELECT id, full_name, email, role, status, institute_id, student_id, department_id, avatar_url, last_login_at, created_at
       FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
    return res.rows;
  },
};
