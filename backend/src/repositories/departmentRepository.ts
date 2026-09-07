import { query } from '../config/database';
import { Department } from '../types/index';

export const departmentRepository = {
  async listByInstitute(instituteId: string): Promise<Department[]> {
    const res = await query(
      `SELECT * FROM departments WHERE institute_id = $1 ORDER BY name ASC`,
      [instituteId]
    );
    return res.rows;
  },

  async findById(id: string): Promise<Department | null> {
    const res = await query(
      `SELECT * FROM departments WHERE id = $1 LIMIT 1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async findByCode(instituteId: string, code: string): Promise<Department | null> {
    const res = await query(
      `SELECT * FROM departments WHERE institute_id = $1 AND UPPER(code) = UPPER($2) LIMIT 1`,
      [instituteId, code]
    );
    return res.rows[0] || null;
  },

  async create(data: {
    institute_id: string;
    code: string;
    name: string;
    description?: string | null;
    head_of_department?: string | null;
  }): Promise<Department> {
    const res = await query(
      `INSERT INTO departments (institute_id, code, name, description, head_of_department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.institute_id,
        data.code.toUpperCase(),
        data.name,
        data.description || null,
        data.head_of_department || null,
      ]
    );
    return res.rows[0];
  },

  async update(id: string, instituteId: string, data: Partial<Department>): Promise<Department | null> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (['code', 'name', 'description', 'head_of_department', 'is_active'].includes(key)) {
        sets.push(`${key} = $${idx}`);
        values.push(key === 'code' && typeof val === 'string' ? val.toUpperCase() : val);
        idx++;
      }
    }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = NOW()`);
    values.push(id);
    values.push(instituteId);

    const res = await query(
      `UPDATE departments SET ${sets.join(', ')} WHERE id = $${idx} AND institute_id = $${idx + 1} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  async delete(id: string, instituteId: string): Promise<boolean> {
    const res = await query(
      `DELETE FROM departments WHERE id = $1 AND institute_id = $2`,
      [id, instituteId]
    );
    return (res.rowCount || 0) > 0;
  },
};

