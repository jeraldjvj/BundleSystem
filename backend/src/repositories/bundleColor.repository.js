import { pool } from '../config/database.js';

const COLUMNS = 'bundle_color_id, color_name_eng, color_name_spa';
const UPDATABLE_FIELDS = ['color_name_eng', 'color_name_spa'];

const toBundleColor = (row) => ({
  bundleColorId: row.bundle_color_id,
  colorNameEng: row.color_name_eng,
  colorNameSpa: row.color_name_spa,
});

export const bundleColorRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle_color ORDER BY bundle_color_id`);
    return rows.map(toBundleColor);
  },

  async findById(bundleColorId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle_color WHERE bundle_color_id = ?`, [bundleColorId]);
    return rows.length ? toBundleColor(rows[0]) : null;
  },

  async create({ color_name_eng, color_name_spa }) {
    const [result] = await pool.query(
      'INSERT INTO bundle_color (color_name_eng, color_name_spa) VALUES (?, ?)',
      [color_name_eng, color_name_spa],
    );
    return this.findById(result.insertId);
  },

  async update(bundleColorId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE bundle_color SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE bundle_color_id = ?`,
        [...fields.map((field) => data[field]), bundleColorId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(bundleColorId);
  },

  async remove(bundleColorId) {
    const [result] = await pool.query('DELETE FROM bundle_color WHERE bundle_color_id = ?', [bundleColorId]);
    return result.affectedRows > 0;
  },
};
