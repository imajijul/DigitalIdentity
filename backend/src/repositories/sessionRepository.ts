import { query } from '../config/database';
import { AcademicSession } from '../types/index';

export const sessionRepository = {
  async listByInstitute(instituteId: string): Promise<AcademicSession[]> {
    const res = await query(
      `SELECT * FROM academic_sessions WHERE institute_id = $1 ORDER BY start_date DESC`,
      [instituteId]
    );
    return res.rows;
  },

  async findById(id: string): Promise<AcademicSession | null> {
    const res = await query(
      `SELECT * FROM academic_sessions WHERE id = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async create(data: {
    institute_id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current?: boolean;
  }): Promise<AcademicSession> {
    if (data.is_current) {
      await query(
        `UPDATE academic_sessions SET is_current = false WHERE institute_id = $1`,
        [data.institute_id]
      );
    }

    const res = await query(
      `INSERT INTO academic_sessions (institute_id, name, start_date, end_date, is_current)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.institute_id,
        data.name,
        data.start_date,
        data.end_date,
        data.is_current || false,
      ]
    );
    return res.rows[0];
  },

  async update(id: string, instituteId: string, data: Partial<AcademicSession>): Promise<AcademicSession | null> {
    if (data.is_current) {
      await query(
        `UPDATE academic_sessions SET is_current = false WHERE institute_id = $1`,
        [instituteId]
      );
    }

    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (['name', 'start_date', 'end_date', 'is_current', 'is_active'].includes(key)) {
        sets.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
    }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = NOW()`);
    values.push(id);
    values.push(instituteId);

    const res = await query(
      `UPDATE academic_sessions SET ${sets.join(', ')} WHERE id = $${idx} AND institute_id = $${idx + 1} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  async delete(id: string, instituteId: string): Promise<boolean> {
    const res = await query(
      `DELETE FROM academic_sessions WHERE id = $1 AND institute_id = $2`,
      [id, instituteId]
    );
    return (res.rowCount || 0) > 0;
  },
};

