import { pool } from '../config/database.js';

const COLUMNS = 'smartphone_color_id, color_name_eng, color_name_spa';
const UPDATABLE_FIELDS = ['color_name_eng', 'color_name_spa'];

const toSmartphoneColor = (row) => ({
  smartphoneColorId: row.smartphone_color_id,
  colorNameEng: row.color_name_eng,
  colorNameSpa: row.color_name_spa,
});

export const smartphoneColorRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM smartphone_color ORDER BY smartphone_color_id`);
    return rows.map(toSmartphoneColor);
  },

  async findById(smartphoneColorId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM smartphone_color WHERE smartphone_color_id = ?`, [smartphoneColorId]);
    return rows.length ? toSmartphoneColor(rows[0]) : null;
  },

  async create({ color_name_eng, color_name_spa }) {
    const [result] = await pool.query(
      'INSERT INTO smartphone_color (color_name_eng, color_name_spa) VALUES (?, ?)',
      [color_name_eng, color_name_spa],
    );
    return this.findById(result.insertId);
  },

  async update(smartphoneColorId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE smartphone_color SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE smartphone_color_id = ?`,
        [...fields.map((field) => data[field]), smartphoneColorId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(smartphoneColorId);
  },

  async remove(smartphoneColorId) {
    const [result] = await pool.query('DELETE FROM smartphone_color WHERE smartphone_color_id = ?', [smartphoneColorId]);
    return result.affectedRows > 0;
  },
};
