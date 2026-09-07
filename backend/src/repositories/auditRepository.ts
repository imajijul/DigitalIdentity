import { query, IDatabaseClient } from '../config/database.ts';
import { AuditLog } from '../types/index.ts';

export const auditRepository = {
  async log(entry: {
    user_id?: string | null;
    institute_id?: string | null;
    action: string;
    target_type: string;
    target_id?: string | null;
    details?: string | null;
    metadata?: any;
    ip_address?: string | null;
    user_agent?: string | null;
  }, client?: IDatabaseClient): Promise<AuditLog> {
    const sql = `
      INSERT INTO audit_logs (
        user_id, institute_id, action, target_type, target_id, details, metadata, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      entry.user_id || null,
      entry.institute_id || null,
      entry.action,
      entry.target_type,
      entry.target_id || null,
      entry.details || null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      entry.ip_address || null,
      entry.user_agent || null,
    ];

    const res = client ? await client.query(sql, params) : await query(sql, params);
    return res.rows[0];
  },

  async list(params: {
    instituteId?: string | null;
    action?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.instituteId) {
      conditions.push(`al.institute_id = $${idx}`);
      values.push(params.instituteId);
      idx++;
    }

    if (params.action) {
      conditions.push(`al.action = $${idx}`);
      values.push(params.action);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*)::int AS count FROM audit_logs al ${whereClause}`,
      values
    );
    const total = countRes.rows[0]?.count || 0;

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const queryStr = `
      SELECT 
        al.*,
        u.full_name AS user_name,
        u.email AS user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(limit);
    values.push(offset);

    const res = await query(queryStr, values);
    return {
      logs: res.rows,
      total,
    };
  },
};
