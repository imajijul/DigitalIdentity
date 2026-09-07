import { query, IDatabaseClient } from '../config/database';
import { StudentIdCard, IdCardStatus } from '../types/index';

export const idCardRepository = {
  async list(params: {
    instituteId?: string | null;
    studentId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ cards: StudentIdCard[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.instituteId) {
      conditions.push(`c.institute_id = $${idx}`);
      values.push(params.instituteId);
      idx++;
    }

    if (params.studentId) {
      conditions.push(`c.student_id = $${idx}`);
      values.push(params.studentId);
      idx++;
    }

    if (params.status) {
      conditions.push(`c.status = $${idx}`);
      values.push(params.status);
      idx++;
    }

    if (params.search && params.search.trim().length > 0) {
      conditions.push(`(
        c.card_number ILIKE $${idx} OR
        s.first_name ILIKE $${idx} OR
        s.last_name ILIKE $${idx} OR
        s.student_id_number ILIKE $${idx}
      )`);
      values.push(`%${params.search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT COUNT(*)::int AS count 
       FROM student_id_cards c
       JOIN students s ON c.student_id = s.id
       ${whereClause}`,
      values
    );
    const total = countRes.rows[0]?.count || 0;

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const queryStr = `
      SELECT 
        c.*,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.student_id_number,
        s.photo_url,
        s.blood_group,
        s.current_semester,
        d.name AS department_name,
        ses.name AS session_name,
        inst.name AS institute_name,
        inst.logo_url AS institute_logo_url
      FROM student_id_cards c
      JOIN students s ON c.student_id = s.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN academic_sessions ses ON s.session_id = ses.id
      LEFT JOIN institutes inst ON c.institute_id = inst.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(limit);
    values.push(offset);

    const res = await query(queryStr, values);
    return {
      cards: res.rows,
      total,
    };
  },

  async findById(id: string, instituteId?: string | null): Promise<StudentIdCard | null> {
    const conditions = ['c.id = $1'];
    const values: any[] = [id];

    if (instituteId) {
      conditions.push('c.institute_id = $2');
      values.push(instituteId);
    }

    const res = await query(
      `SELECT 
        c.*,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.student_id_number,
        s.photo_url,
        s.blood_group,
        s.current_semester,
        d.name AS department_name,
        ses.name AS session_name,
        inst.name AS institute_name,
        inst.logo_url AS institute_logo_url
       FROM student_id_cards c
       JOIN students s ON c.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       LEFT JOIN academic_sessions ses ON s.session_id = ses.id
       LEFT JOIN institutes inst ON c.institute_id = inst.id
       WHERE ${conditions.join(' AND ')}
       LIMIT 1`,
      values
    );
    return res.rows[0] || null;
  },

  async findActiveByStudentId(studentId: string): Promise<StudentIdCard | null> {
    const res = await query(
      `SELECT 
        c.*,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.student_id_number,
        s.photo_url,
        s.blood_group,
        s.current_semester,
        d.name AS department_name,
        ses.name AS session_name,
        inst.name AS institute_name,
        inst.logo_url AS institute_logo_url
       FROM student_id_cards c
       JOIN students s ON c.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       LEFT JOIN academic_sessions ses ON s.session_id = ses.id
       LEFT JOIN institutes inst ON c.institute_id = inst.id
       WHERE c.student_id = $1 AND c.status = 'ACTIVE'
       ORDER BY c.version DESC
       LIMIT 1`,
      [studentId]
    );
    return res.rows[0] || null;
  },

  async findByVerificationToken(token: string): Promise<StudentIdCard | null> {
    const res = await query(
      `SELECT 
        c.*,
        (s.first_name || ' ' || s.last_name) AS student_name,
        s.student_id_number,
        s.photo_url,
        s.blood_group,
        s.current_semester,
        d.name AS department_name,
        ses.name AS session_name,
        inst.name AS institute_name,
        inst.logo_url AS institute_logo_url
       FROM student_id_cards c
       JOIN students s ON c.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       LEFT JOIN academic_sessions ses ON s.session_id = ses.id
       LEFT JOIN institutes inst ON c.institute_id = inst.id
       WHERE c.verification_token = $1
       LIMIT 1`,
      [token]
    );
    return res.rows[0] || null;
  },

  async create(data: {
    student_id: string;
    institute_id: string;
    card_number: string;
    version: number;
    issue_date: string;
    expiry_date: string;
    status?: IdCardStatus;
    verification_token: string;
    verification_token_hash: string;
    theme?: string;
    qr_url?: string | null;
  }, client?: IDatabaseClient): Promise<StudentIdCard> {
    const sql = `
      INSERT INTO student_id_cards (
        student_id, institute_id, card_number, version, issue_date, expiry_date,
        status, verification_token, verification_token_hash, theme, qr_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const params = [
      data.student_id,
      data.institute_id,
      data.card_number,
      data.version || 1,
      data.issue_date,
      data.expiry_date,
      data.status || 'ACTIVE',
      data.verification_token,
      data.verification_token_hash,
      data.theme || 'navy',
      data.qr_url || null,
    ];

    const res = client ? await client.query(sql, params) : await query(sql, params);
    return res.rows[0];
  },

  async revoke(id: string, reason: string, client?: IDatabaseClient): Promise<StudentIdCard | null> {
    const sql = `
      UPDATE student_id_cards
      SET status = 'REVOKED', revoked_reason = $1, revoked_at = NOW(), updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const params = [reason, id];
    const res = client ? await client.query(sql, params) : await query(sql, params);
    return res.rows[0] || null;
  },

  async revokeAllActiveByStudentId(studentId: string, reason: string, client?: IDatabaseClient): Promise<void> {
    const sql = `
      UPDATE student_id_cards
      SET status = 'REVOKED', revoked_reason = $1, revoked_at = NOW(), updated_at = NOW()
      WHERE student_id = $2 AND status = 'ACTIVE'
    `;
    const params = [reason, studentId];
    if (client) {
      await client.query(sql, params);
    } else {
      await query(sql, params);
    }
  },
};

