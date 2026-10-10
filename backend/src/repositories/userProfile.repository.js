import { pool } from '../config/database.js';

const COLUMNS = 'profile_id, user_id, first_name, last_name, role_title, date_of_birth, profile_picture';
const UPDATABLE_FIELDS = ['user_id', 'first_name', 'last_name', 'role_title', 'date_of_birth', 'profile_picture'];

const toUserProfile = (row) => ({
  profileId: row.profile_id,
  userId: row.user_id,
  firstName: row.first_name,
  lastName: row.last_name,
  roleTitle: row.role_title,
  dateOfBirth: row.date_of_birth,
  profilePicture: row.profile_picture,
});

export const userProfileRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM user_profile ORDER BY profile_id`);
    return rows.map(toUserProfile);
  },

  async findById(profileId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM user_profile WHERE profile_id = ?`, [profileId]);
    return rows.length ? toUserProfile(rows[0]) : null;
  },

  async create({ user_id, first_name, last_name, role_title, date_of_birth, profile_picture }) {
    const [result] = await pool.query(
      'INSERT INTO user_profile (user_id, first_name, last_name, role_title, date_of_birth, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, first_name, last_name, role_title, date_of_birth, profile_picture],
    );
    return this.findById(result.insertId);
  },

  async update(profileId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE user_profile SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE profile_id = ?`,
        [...fields.map((field) => data[field]), profileId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(profileId);
  },

  async remove(profileId) {
    const [result] = await pool.query('DELETE FROM user_profile WHERE profile_id = ?', [profileId]);
    return result.affectedRows > 0;
  },
};
