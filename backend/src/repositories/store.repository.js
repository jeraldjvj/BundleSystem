import { pool } from '../config/database.js';

const COLUMNS = 's.store_code, s.user_id, s.store_name, s.city, u.mi_id, CONCAT(up.first_name, \' \', up.last_name) as user_full_name, u.email';
const UPDATABLE_FIELDS = ['user_id', 'store_name', 'city'];

const toStore = (row) => ({
  storeCode: row.store_code,
  userId: row.user_id,
  storeName: row.store_name,
  city: row.city,
  miId: row.mi_id,
  userFullName: row.user_full_name,
  userEmail: row.email,
});

export const storeRepository = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM stores s LEFT JOIN user u ON s.user_id = u.user_id LEFT JOIN user_profile up ON u.user_id = up.user_id ORDER BY s.store_code`
    );
    return rows.map(toStore);
  },

  async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM stores s LEFT JOIN user u ON s.user_id = u.user_id LEFT JOIN user_profile up ON u.user_id = up.user_id WHERE s.user_id = ? ORDER BY s.store_name`,
      [userId]
    );
    return rows.map(toStore);
  },

  async findById(storeCode) {
    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM stores s LEFT JOIN user u ON s.user_id = u.user_id LEFT JOIN user_profile up ON u.user_id = up.user_id WHERE s.store_code = ?`,
      [storeCode]
    );
    return rows.length ? toStore(rows[0]) : null;
  },

  async create({ store_code, user_id, store_name, city }) {
    const [result] = await pool.query(
      'INSERT INTO stores (store_code, user_id, store_name, city) VALUES (?, ?, ?, ?)',
      [store_code, user_id, store_name, city],
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
