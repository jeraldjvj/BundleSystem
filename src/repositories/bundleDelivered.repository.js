import { pool } from '../config/database.js';

const COLUMNS = 'bundle_delivered_id, user_id, bundle_id, smartphones_id, client_full_name, client_phone, client_picture, create_time, store_code, store_name';
const UPDATABLE_FIELDS = ['user_id', 'bundle_id', 'smartphones_id', 'client_full_name', 'client_phone', 'client_picture', 'create_time', 'store_code', 'store_name'];

const toBundleDelivered = (row) => ({
  bundleDeliveredId: row.bundle_delivered_id,
  userId: row.user_id,
  bundleId: row.bundle_id,
  smartphonesId: row.smartphones_id,
  clientFullName: row.client_full_name,
  clientPhone: row.client_phone,
  clientPicture: row.client_picture,
  createTime: row.create_time,
  storeCode: row.store_code,
  storeName: row.store_name,
});

export const bundleDeliveredRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle_delivered ORDER BY bundle_delivered_id`);
    return rows.map(toBundleDelivered);
  },

  async findById(bundleDeliveredId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle_delivered WHERE bundle_delivered_id = ?`, [bundleDeliveredId]);
    return rows.length ? toBundleDelivered(rows[0]) : null;
  },

  async create({ user_id, bundle_id, smartphones_id, client_full_name, client_phone, client_picture, create_time, store_code, store_name }) {
    const [result] = await pool.query(
      'INSERT INTO bundle_delivered (user_id, bundle_id, smartphones_id, client_full_name, client_phone, client_picture, create_time, store_code, store_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, bundle_id, smartphones_id, client_full_name, client_phone, client_picture, create_time || new Date(), store_code, store_name],
    );
    return this.findById(result.insertId);
  },

  async update(bundleDeliveredId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE bundle_delivered SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE bundle_delivered_id = ?`,
        [...fields.map((field) => data[field]), bundleDeliveredId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(bundleDeliveredId);
  },

  async remove(bundleDeliveredId) {
    const [result] = await pool.query('DELETE FROM bundle_delivered WHERE bundle_delivered_id = ?', [bundleDeliveredId]);
    return result.affectedRows > 0;
  },
};
