import { query } from '../config/database.ts';
import { Institute } from '../types/index.ts';

export const instituteRepository = {
  async findById(id: string): Promise<Institute | null> {
    const res = await query(
      `SELECT * FROM institutes WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [id]
    );
    return res.rows[0] || null;
  },

  async findByCode(code: string): Promise<Institute | null> {
    const res = await query(
      `SELECT * FROM institutes WHERE UPPER(code) = UPPER($1) AND deleted_at IS NULL LIMIT 1`,
      [code]
    );
    return res.rows[0] || null;
  },

  async listAll(): Promise<Institute[]> {
    const res = await query(
      `SELECT * FROM institutes WHERE deleted_at IS NULL ORDER BY name ASC`
    );
    return res.rows;
  },

  async create(data: {
    name: string;
    code: string;
    logo_url?: string | null;
    address?: string | null;
    phone?: string | null;
    email: string;
    website?: string | null;
  }): Promise<Institute> {
    const res = await query(
      `INSERT INTO institutes (name, code, logo_url, address, phone, email, website)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.name,
        data.code.toUpperCase(),
        data.logo_url || null,
        data.address || null,
        data.phone || null,
        data.email,
        data.website || null,
      ]
    );
    return res.rows[0];
  },

  async update(id: string, data: Partial<Institute>): Promise<Institute | null> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (['name', 'code', 'logo_url', 'address', 'phone', 'email', 'website', 'status'].includes(key)) {
        sets.push(`${key} = $${idx}`);
        values.push(key === 'code' && typeof val === 'string' ? val.toUpperCase() : val);
        idx++;
      }
    }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = NOW()`);
    values.push(id);

    const res = await query(
      `UPDATE institutes SET ${sets.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const res = await query(
      `UPDATE institutes SET deleted_at = NOW(), status = 'INACTIVE' WHERE id = $1`,
      [id]
    );
    return (res.rowCount || 0) > 0;
  },
};
