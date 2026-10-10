import { pool } from '../config/database.js';

const COLUMNS = 'bundle_model_id, bundle_name, bundle_color_id';
const UPDATABLE_FIELDS = ['bundle_name', 'bundle_color_id'];

const toBundleModel = (row) => ({
  bundleModelId: row.bundle_model_id,
  bundleName: row.bundle_name,
  bundleColorId: row.bundle_color_id,
});

export const bundleModelRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle_model ORDER BY bundle_model_id`);
    return rows.map(toBundleModel);
  },

  async findById(bundleModelId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle_model WHERE bundle_model_id = ?`, [bundleModelId]);
    return rows.length ? toBundleModel(rows[0]) : null;
  },

  async create({ bundle_name, bundle_color_id }) {
    const [result] = await pool.query(
      'INSERT INTO bundle_model (bundle_name, bundle_color_id) VALUES (?, ?)',
      [bundle_name, bundle_color_id],
    );
    return this.findById(result.insertId);
  },

  async update(bundleModelId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE bundle_model SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE bundle_model_id = ?`,
        [...fields.map((field) => data[field]), bundleModelId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(bundleModelId);
  },

  async remove(bundleModelId) {
    const [result] = await pool.query('DELETE FROM bundle_model WHERE bundle_model_id = ?', [bundleModelId]);
    return result.affectedRows > 0;
  },
};
