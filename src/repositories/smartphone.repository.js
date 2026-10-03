import { pool } from '../config/database.js';

const COLUMNS = 'smartphones_id, smartphone_model_id, tag_model, imei_1, distributor, status';
const UPDATABLE_FIELDS = ['smartphone_model_id', 'tag_model', 'imei_1', 'distributor', 'status'];

const toSmartphone = (row) => ({
  smartphonesId: row.smartphones_id,
  smartphoneModelId: row.smartphone_model_id,
  tagModel: row.tag_model,
  imei1: row.imei_1,
  distributor: row.distributor,
  status: row.status,
});

export const smartphoneRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM smartphones_database ORDER BY smartphones_id`);
    return rows.map(toSmartphone);
  },

  async findById(smartphonesId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM smartphones_database WHERE smartphones_id = ?`, [smartphonesId]);
    return rows.length ? toSmartphone(rows[0]) : null;
  },

  async create({ smartphones_id, smartphone_model_id, tag_model, imei_1, distributor, status = 'available' }) {
    const [result] = await pool.query(
      'INSERT INTO smartphones_database (smartphones_id, smartphone_model_id, tag_model, imei_1, distributor, status) VALUES (?, ?, ?, ?, ?, ?)',
      [smartphones_id, smartphone_model_id, tag_model, imei_1, distributor, status],
    );
    return this.findById(smartphones_id);
  },

  async update(smartphonesId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE smartphones_database SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE smartphones_id = ?`,
        [...fields.map((field) => data[field]), smartphonesId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(smartphonesId);
  },

  async remove(smartphonesId) {
    const [result] = await pool.query('DELETE FROM smartphones_database WHERE smartphones_id = ?', [smartphonesId]);
    return result.affectedRows > 0;
  },
};
