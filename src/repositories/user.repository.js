import { pool } from '../config/database.js';

const COLUMNS = 'user_id, mi_id, email, password_hash, status, level_user, create_time, updated_at';
const UPDATABLE_FIELDS = ['mi_id', 'email', 'password_hash', 'status', 'level_user'];

const toUser = (row) => ({
  userId: row.user_id,
  miId: row.mi_id,
  email: row.email,
  passwordHash: row.password_hash,
  status: row.status,
  levelUser: row.level_user,
  createTime: row.create_time,
  updatedAt: row.updated_at,
});

export const userRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM user ORDER BY user_id`);
    return rows.map(toUser);
  },

  async findById(userId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM user WHERE user_id = ?`, [userId]);
    return rows.length ? toUser(rows[0]) : null;
  },

  async create({ mi_id, email, password_hash, status = 'active', level_user = 'field force' }) {
    const [result] = await pool.query(
      'INSERT INTO user (mi_id, email, password_hash, status, level_user) VALUES (?, ?, ?, ?, ?)',
      [mi_id, email, password_hash, status, level_user],
    );
    return this.findById(result.insertId);
  },

  async update(userId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE user SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE user_id = ?`,
        [...fields.map((field) => data[field]), userId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(userId);
  },

  async remove(userId) {
    const [result] = await pool.query('DELETE FROM user WHERE user_id = ?', [userId]);
    return result.affectedRows > 0;
  },
};
