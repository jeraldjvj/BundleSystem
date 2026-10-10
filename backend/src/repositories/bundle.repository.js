import { pool } from '../config/database.js';

const COLUMNS = 'bundle_id, project_id, user_id, serial_number, bundle_model_id, bundle_color_id, create_time';
const UPDATABLE_FIELDS = ['project_id', 'user_id', 'serial_number', 'bundle_model_id', 'bundle_color_id', 'create_time'];

const toBundle = (row) => ({
  bundleId: row.bundle_id,
  projectId: row.project_id,
  userId: row.user_id,
  serialNumber: row.serial_number,
  bundleModelId: row.bundle_model_id,
  bundleColorId: row.bundle_color_id,
  createTime: row.create_time,
});

export const bundleRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle ORDER BY bundle_id`);
    return rows.map(toBundle);
  },

  async findById(bundleId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle WHERE bundle_id = ?`, [bundleId]);
    return rows.length ? toBundle(rows[0]) : null;
  },

  async create({ project_id, user_id, serial_number, bundle_model_id, bundle_color_id, create_time }) {
    const [result] = await pool.query(
      'INSERT INTO bundle (project_id, user_id, serial_number, bundle_model_id, bundle_color_id, create_time) VALUES (?, ?, ?, ?, ?, ?)',
      [project_id, user_id, serial_number, bundle_model_id, bundle_color_id, create_time || new Date()],
    );
    return this.findById(result.insertId);
  },

  async update(bundleId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE bundle SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE bundle_id = ?`,
        [...fields.map((field) => data[field]), bundleId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(bundleId);
  },

  async remove(bundleId) {
    const [result] = await pool.query('DELETE FROM bundle WHERE bundle_id = ?', [bundleId]);
    return result.affectedRows > 0;
  },
};
