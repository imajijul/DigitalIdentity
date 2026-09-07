import { query } from '../config/database.ts';
import { VerificationLog, VerificationResult } from '../types/index.ts';

export const verificationRepository = {
  async log(entry: {
    student_id?: string | null;
    card_id?: string | null;
    institute_id?: string | null;
    token_identifier: string;
    verification_result: VerificationResult;
    ip_address?: string | null;
    user_agent?: string | null;
    device_type?: string | null;
    location?: string | null;
    is_suspicious?: boolean;
    metadata?: any;
  }): Promise<VerificationLog> {
    const res = await query(
      `INSERT INTO verification_logs (
        student_id, card_id, institute_id, token_identifier, verification_result,
        ip_address, user_agent, device_type, location, is_suspicious, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        entry.student_id || null,
        entry.card_id || null,
        entry.institute_id || null,
        entry.token_identifier,
        entry.verification_result,
        entry.ip_address || null,
        entry.user_agent || null,
        entry.device_type || 'Browser / Scanner',
        entry.location || 'Online Verification Hub',
        entry.is_suspicious || false,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
      ]
    );
    return res.rows[0];
  },

  async list(params: {
    instituteId?: string | null;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: VerificationLog[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.instituteId) {
      conditions.push(`vl.institute_id = $${idx}`);
      values.push(params.instituteId);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*)::int AS count FROM verification_logs vl ${whereClause}`,
      values
    );
    const total = countRes.rows[0]?.count || 0;

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const queryStr = `
      SELECT 
        vl.*,
        (s.first_name || ' ' || s.last_name) AS student_name,
        c.card_number,
        inst.name AS institute_name
      FROM verification_logs vl
      LEFT JOIN students s ON vl.student_id = s.id
      LEFT JOIN student_id_cards c ON vl.card_id = c.id
      LEFT JOIN institutes inst ON vl.institute_id = inst.id
      ${whereClause}
      ORDER BY vl.verified_at DESC
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
