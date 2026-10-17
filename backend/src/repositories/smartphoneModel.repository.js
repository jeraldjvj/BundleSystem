import { pool } from '../config/database.js';

const COLUMNS = 'smartphone_model_id, product_id, model_name, sku_name, ram, rom, color_eng';
const UPDATABLE_FIELDS = ['product_id', 'model_name', 'sku_name', 'ram', 'rom', 'color_eng'];

const toSmartphoneModel = (row) => ({
  smartphoneModelId: row.smartphone_model_id,
  productId: row.product_id,
  modelName: row.model_name,
  skuName: row.sku_name,
  ram: row.ram,
  rom: row.rom,
  colorEng: row.color_eng,
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

  async create({ product_id, model_name, sku_name, ram, rom, color_eng }) {
    const [result] = await pool.query(
      'INSERT INTO smartphone_model (product_id, model_name, sku_name, ram, rom, color_eng) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, model_name, sku_name, ram, rom, color_eng],
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
