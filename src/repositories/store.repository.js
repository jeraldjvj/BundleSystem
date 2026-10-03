import { pool } from '../config/database.js';

const COLUMNS = 'store_code, user_id, rms_store_code, store_name';
const UPDATABLE_FIELDS = ['user_id', 'rms_store_code', 'store_name'];

const toStore = (row) => ({
  storeCode: row.store_code,
  userId: row.user_id,
  rmsStoreCode: row.rms_store_code,
  storeName: row.store_name,
});

export const storeRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM stores ORDER BY store_code`);
    return rows.map(toStore);
  },

  async findById(storeCode) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM stores WHERE store_code = ?`, [storeCode]);
    return rows.length ? toStore(rows[0]) : null;
  },

  async create({ store_code, user_id, rms_store_code, store_name }) {
    const [result] = await pool.query(
      'INSERT INTO stores (store_code, user_id, rms_store_code, store_name) VALUES (?, ?, ?, ?)',
      [store_code, user_id, rms_store_code, store_name],
    );
    return this.findById(store_code);
  },

  async update(storeCode, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE stores SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE store_code = ?`,
        [...fields.map((field) => data[field]), storeCode],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(storeCode);
  },

  async remove(storeCode) {
    const [result] = await pool.query('DELETE FROM stores WHERE store_code = ?', [storeCode]);
    return result.affectedRows > 0;
  },
};
