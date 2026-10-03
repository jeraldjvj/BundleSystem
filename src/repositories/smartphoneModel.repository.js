import { pool } from '../config/database.js';

const COLUMNS = 'smartphone_model_id, smartphone_color_id, model_code, model_name, ram, rom';
const UPDATABLE_FIELDS = ['smartphone_color_id', 'model_code', 'model_name', 'ram', 'rom'];

const toSmartphoneModel = (row) => ({
  smartphoneModelId: row.smartphone_model_id,
  smartphoneColorId: row.smartphone_color_id,
  modelCode: row.model_code,
  modelName: row.model_name,
  ram: row.ram,
  rom: row.rom,
});

export const smartphoneModelRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM smartphone_model ORDER BY smartphone_model_id`);
    return rows.map(toSmartphoneModel);
  },

  async findById(smartphoneModelId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM smartphone_model WHERE smartphone_model_id = ?`, [smartphoneModelId]);
    return rows.length ? toSmartphoneModel(rows[0]) : null;
  },

  async create({ smartphone_color_id, model_code, model_name, ram, rom }) {
    const [result] = await pool.query(
      'INSERT INTO smartphone_model (smartphone_color_id, model_code, model_name, ram, rom) VALUES (?, ?, ?, ?, ?)',
      [smartphone_color_id, model_code, model_name, ram, rom],
    );
    return this.findById(result.insertId);
  },

  async update(smartphoneModelId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE smartphone_model SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE smartphone_model_id = ?`,
        [...fields.map((field) => data[field]), smartphoneModelId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(smartphoneModelId);
  },

  async remove(smartphoneModelId) {
    const [result] = await pool.query('DELETE FROM smartphone_model WHERE smartphone_model_id = ?', [smartphoneModelId]);
    return result.affectedRows > 0;
  },
};
