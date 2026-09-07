import { query, IDatabaseClient } from '../config/database.ts';
import { Notification } from '../types/index.ts';

export const notificationRepository = {
  async listByUser(userId: string): Promise<Notification[]> {
    const res = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    return res.rows;
  },

  async create(data: {
    user_id: string;
    institute_id: string;
    title: string;
    message: string;
    type?: string;
  }, client?: IDatabaseClient): Promise<Notification> {
    const sql = `
      INSERT INTO notifications (user_id, institute_id, title, message, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [
      data.user_id,
      data.institute_id,
      data.title,
      data.message,
      data.type || 'INFO',
    ];

    const res = client ? await client.query(sql, params) : await query(sql, params);
    return res.rows[0];
  },

  async markAsRead(id: string, userId: string): Promise<boolean> {
    const res = await query(
      `UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return (res.rowCount || 0) > 0;
  },

  async markAllAsRead(userId: string): Promise<void> {
    await query(
      `UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
  },
};
