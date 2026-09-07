import { query, IDatabaseClient } from '../config/database';
import { Student } from '../types/index';

export const studentRepository = {
  async list(params: {
    instituteId?: string | null;
    search?: string;
    departmentId?: string;
    sessionId?: string;
    status?: string;
    semester?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ students: Student[]; total: number }> {
    const conditions: string[] = ['s.deleted_at IS NULL'];
    const values: any[] = [];
    let idx = 1;

    if (params.instituteId) {
      conditions.push(`s.institute_id = $${idx}`);
      values.push(params.instituteId);
      idx++;
    }

    if (params.search && params.search.trim().length > 0) {
      conditions.push(`(
        s.first_name ILIKE $${idx} OR 
        s.last_name ILIKE $${idx} OR 
        s.student_id_number ILIKE $${idx} OR 
        s.email ILIKE $${idx}
      )`);
      values.push(`%${params.search.trim()}%`);
      idx++;
    }

    if (params.departmentId) {
      conditions.push(`s.department_id = $${idx}`);
      values.push(params.departmentId);
      idx++;
    }

    if (params.sessionId) {
      conditions.push(`s.session_id = $${idx}`);
      values.push(params.sessionId);
      idx++;
    }

    if (params.status) {
      conditions.push(`s.status = $${idx}`);
      values.push(params.status);
      idx++;
    }

    if (params.semester) {
      conditions.push(`s.current_semester = $${idx}`);
      values.push(params.semester);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const countRes = await query(
      `SELECT COUNT(*)::int AS count FROM students s ${whereClause}`,
      values
    );
    const total = countRes.rows[0]?.count || 0;

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const queryStr = `
      SELECT 
        s.*,
        d.name AS department_name,
        d.code AS department_code,
        ses.name AS session_name,
        inst.name AS institute_name,
        c.card_number AS active_card_number,
        c.status AS card_status
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN academic_sessions ses ON s.session_id = ses.id
      LEFT JOIN institutes inst ON s.institute_id = inst.id
      LEFT JOIN student_id_cards c ON s.id = c.student_id AND c.status = 'ACTIVE'
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    values.push(limit);
    values.push(offset);

    const res = await query(queryStr, values);
    return {
      students: res.rows,
      total,
    };
  },

  async findById(id: string, instituteId?: string | null): Promise<Student | null> {
    const conditions = ['s.id = $1', 's.deleted_at IS NULL'];
    const values: any[] = [id];

    if (instituteId) {
      conditions.push('s.institute_id = $2');
      values.push(instituteId);
    }

    const res = await query(
      `SELECT 
        s.*,
        d.name AS department_name,
        d.code AS department_code,
        ses.name AS session_name,
        inst.name AS institute_name,
        c.card_number AS active_card_number,
        c.status AS card_status
       FROM students s
       LEFT JOIN departments d ON s.department_id = d.id
       LEFT JOIN academic_sessions ses ON s.session_id = ses.id
       LEFT JOIN institutes inst ON s.institute_id = inst.id
       LEFT JOIN student_id_cards c ON s.id = c.student_id AND c.status = 'ACTIVE'
       WHERE ${conditions.join(' AND ')}
       LIMIT 1`,
      values
    );
    return res.rows[0] || null;
  },

  async findByStudentIdNumber(instituteId: string, studentIdNumber: string): Promise<Student | null> {
    const res = await query(
      `SELECT * FROM students WHERE institute_id = $1 AND UPPER(student_id_number) = UPPER($2) AND deleted_at IS NULL LIMIT 1`,
      [instituteId, studentIdNumber]
    );
    return res.rows[0] || null;
  },

  async create(data: {
    institute_id: string;
    student_id_number: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    date_of_birth?: string | null;
    blood_group?: string | null;
    department_id?: string | null;
    session_id?: string | null;
    current_semester?: string;
    photo_url?: string | null;
    emergency_contact?: string | null;
    address?: string | null;
    admission_date?: string;
  }, client?: IDatabaseClient): Promise<Student> {
    const sql = `
      INSERT INTO students (
        institute_id, student_id_number, first_name, last_name, email,
        phone, date_of_birth, blood_group, department_id, session_id,
        current_semester, photo_url, emergency_contact, address, admission_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const params = [
      data.institute_id,
      data.student_id_number,
      data.first_name,
      data.last_name,
      data.email,
      data.phone || null,
      data.date_of_birth || null,
      data.blood_group || null,
      data.department_id || null,
      data.session_id || null,
      data.current_semester || '1st Semester',
      data.photo_url || null,
      data.emergency_contact || null,
      data.address || null,
      data.admission_date || new Date().toISOString().split('T')[0],
    ];

    const res = client ? await client.query(sql, params) : await query(sql, params);
    return res.rows[0];
  },

  /**
   * Safe UPDATE operation: enforces protected fields.
   * id, institute_id, student_id_number, and created_at cannot be altered arbitrarily.
   */
  async update(
    id: string,
    instituteId: string | null,
    data: Partial<Student>,
    client?: IDatabaseClient
  ): Promise<Student | null> {
    const allowedFields = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'date_of_birth',
      'blood_group',
      'department_id',
      'session_id',
      'current_semester',
      'status',
      'photo_url',
      'emergency_contact',
      'address',
      'admission_date',
    ];

    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        sets.push(`${key} = $${idx}`);
        values.push(val === '' ? null : val);
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
    whereClause += ` AND deleted_at IS NULL`;

    const sql = `UPDATE students SET ${sets.join(', ')} WHERE ${whereClause} RETURNING *`;
    const res = client ? await client.query(sql, values) : await query(sql, values);
    return res.rows[0] || null;
  },

  async softDelete(id: string, instituteId: string | null): Promise<boolean> {
    const conditions = ['id = $1'];
    const values: any[] = [id];

    if (instituteId) {
      conditions.push('institute_id = $2');
      values.push(instituteId);
    }

    const res = await query(
      `UPDATE students SET deleted_at = NOW(), status = 'SUSPENDED' WHERE ${conditions.join(' AND ')}`,
      values
    );
    return (res.rowCount || 0) > 0;
  },
};

