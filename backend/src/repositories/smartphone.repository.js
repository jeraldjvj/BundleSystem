import { pool } from '../config/database.js';

const COLUMNS = 'smartphones_id, smartphone_model_id, tag_model, imei_1, distributor_id, status';
const UPDATABLE_FIELDS = ['smartphone_model_id', 'tag_model', 'imei_1', 'distributor_id', 'status'];

const toSmartphone = (row) => ({
  smartphonesId: row.smartphones_id,
  smartphoneModelId: row.smartphone_model_id,
  tagModel: row.tag_model,
  imei1: row.imei_1,
  distributorId: row.distributor_id,
  status: row.status,
  modelName: row.model_name,
  productId: row.product_id,
  skuName: row.sku_name,
  distributorName: row.distributor_name,
});

export const smartphoneRepository = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT s.${COLUMNS.split(', ').join(', s.')},
        sm.model_name,
        sm.product_id,
        sm.sku_name,
        d.distributor_name
      FROM smartphones_database s
      LEFT JOIN smartphone_model sm ON s.smartphone_model_id = sm.smartphone_model_id
      LEFT JOIN distributor d ON s.distributor_id = d.distributor_id
      ORDER BY s.smartphones_id
    `);
    return rows.map(toSmartphone);
  },

  async findById(smartphonesId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM smartphones_database WHERE smartphones_id = ?`, [smartphonesId]);
    return rows.length ? toSmartphone(rows[0]) : null;
  },

  async findByImei(imei) {
    const [rows] = await pool.query(`
      SELECT s.${COLUMNS.split(', ').join(', s.')},
        sm.model_name,
        sm.product_id,
        sm.sku_name,
        d.distributor_name
      FROM smartphones_database s
      LEFT JOIN smartphone_model sm ON s.smartphone_model_id = sm.smartphone_model_id
      LEFT JOIN distributor d ON s.distributor_id = d.distributor_id
      WHERE s.imei_1 = ?
    `, [imei]);
    return rows.length ? toSmartphone(rows[0]) : null;
  },

  async create({ smartphones_id, smartphone_model_id, tag_model, imei_1, distributor_id, status = 'available' }) {
    // Sin AUTO_INCREMENT (el FK lo impide): MAX+1 con reintentos si otro
    // insert concurrente gana la carrera
    for (let attempt = 0; attempt < 3; attempt++) {
      const [[{ maxId }]] = await pool.query('SELECT MAX(smartphones_id) as maxId FROM smartphones_database');
      const id = smartphones_id || (maxId || 0) + 1;
      try {
        await pool.query(
          'INSERT INTO smartphones_database (smartphones_id, smartphone_model_id, tag_model, imei_1, distributor_id, status) VALUES (?, ?, ?, ?, ?, ?)',
          [id, smartphone_model_id, tag_model, imei_1, distributor_id, status],
        );
        return this.findById(id);
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY' || smartphones_id || attempt === 2) throw err;
      }
    }
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
