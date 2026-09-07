import { query, IDatabaseClient } from '../config/database.ts';
import { IdCardApplication, ApplicationStatus, ApplicationType } from '../types/index.ts';

export const applicationRepository = {
  async list(params: {
    instituteId?: string | null;
    studentId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ applications: IdCardApplication[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.instituteId) {
      conditions.push(`a.institute_id = $${idx}`);
      values.push(params.instituteId);
      idx++;
    }

    if (params.studentId) {
      conditions.push(`a.student_id = $${idx}`);
      values.push(params.studentId);
      idx++;
    }

    if (params.status) {
      conditions.push(`a.status = $${idx}`);
      values.push(params.status);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*)::int AS count FROM id_card_applications a ${whereClause}`,
      values
    );
    const total = countRes.rows[0]?.count || 0;

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const queryStr = `
      SELECT 
        a.*,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.student_id_number,
        d.name AS department_name
      FROM id_card_applications a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN departments d ON s.department_id = d.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(limit);
    values.push(offset);

    const res = await query(queryStr, values);
    return {
      applications: res.rows,
      total,
    };
  },

  async findById(id: string, instituteId?: string | null): Promise<IdCardApplication | null> {
    const conditions = ['a.id = $1'];
    const values: any[] = [id];

    if (instituteId) {
      conditions.push('a.institute_id = $2');
      values.push(instituteId);
    }

    const res = await query(
      `SELECT 
        a.*,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.student_id_number,
        d.name AS department_name
       FROM id_card_applications a
       JOIN students s ON a.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE ${conditions.join(' AND ')}
       LIMIT 1`,
      values
    );
    return res.rows[0] || null;
  },

  async create(data: {
    student_id: string;
    institute_id: string;
    application_type: ApplicationType;
    reason?: string | null;
  }): Promise<IdCardApplication> {
    const res = await query(
      `INSERT INTO id_card_applications (
        student_id, institute_id, application_type, status, reason
      ) VALUES ($1, $2, $3, 'PENDING', $4)
      RETURNING *`,
      [
        data.student_id,
        data.institute_id,
        data.application_type,
        data.reason || null,
      ]
    );
    return res.rows[0];
  },

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    reviewedBy: string,
    client?: IDatabaseClient
  ): Promise<IdCardApplication | null> {
    const sql = `
      UPDATE id_card_applications
      SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const params = [status, reviewedBy, id];
    const res = client ? await client.query(sql, params) : await query(sql, params);
    return res.rows[0] || null;
  },
};
