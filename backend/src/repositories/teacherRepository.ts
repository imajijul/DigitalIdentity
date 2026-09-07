import { query } from '../config/database';
import { Teacher } from '../types/index';

export const teacherRepository = {
  async listByInstitute(instituteId?: string | null): Promise<Teacher[]> {
    if (instituteId) {
      const res = await query(
        `SELECT t.*, d.name AS department_name
         FROM teachers t
         LEFT JOIN departments d ON t.department_id = d.id
         WHERE t.institute_id = $1
         ORDER BY t.created_at DESC`,
        [instituteId]
      );
      return res.rows;
    }
    const res = await query(
      `SELECT t.*, d.name AS department_name
       FROM teachers t
       LEFT JOIN departments d ON t.department_id = d.id
       ORDER BY t.created_at DESC`
    );
    return res.rows;
  },

  async findById(id: string, instituteId?: string | null): Promise<Teacher | null> {
    const conditions = ['t.id = $1'];
    const values: any[] = [id];

    if (instituteId) {
      conditions.push('t.institute_id = $2');
      values.push(instituteId);
    }

    const res = await query(
      `SELECT t.*, d.name AS department_name
       FROM teachers t
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE ${conditions.join(' AND ')}
       LIMIT 1`,
      values
    );
    return res.rows[0] || null;
  },

  async create(data: {
    institute_id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    designation: string;
    staff_role?: string | null;
    department_id?: string | null;
    user_id?: string | null;
  }): Promise<Teacher> {
    const res = await query(
      `INSERT INTO teachers (
        institute_id, employee_id, first_name, last_name, phone, designation, staff_role, department_id, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.institute_id,
        data.employee_id,
        data.first_name,
        data.last_name,
        data.phone || null,
        data.designation,
        data.staff_role || 'Faculty Member',
        data.department_id || null,
        data.user_id || null,
      ]
    );
    return res.rows[0];
  },

  async update(id: string, instituteId: string | null, data: Partial<Teacher>): Promise<Teacher | null> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (['first_name', 'last_name', 'phone', 'designation', 'staff_role', 'department_id', 'status'].includes(key)) {
        sets.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
    }

    if (sets.length === 0) return this.findById(id, instituteId);

    sets.push(`updated_at = NOW()`);
    values.push(id);
    let whereClause = `id = $${idx}`;

    if (instituteId) {
      idx++;
      values.push(instituteId);
      whereClause += ` AND institute_id = $${idx}`;
    }

    const res = await query(
      `UPDATE teachers SET ${sets.join(', ')} WHERE ${whereClause} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  async delete(id: string, instituteId: string | null): Promise<boolean> {
    const conditions = ['id = $1'];
    const values: any[] = [id];

    if (instituteId) {
      conditions.push('institute_id = $2');
      values.push(instituteId);
    }

    const res = await query(
      `DELETE FROM teachers WHERE ${conditions.join(' AND ')}`,
      values
    );
    return (res.rowCount || 0) > 0;
  },
};

