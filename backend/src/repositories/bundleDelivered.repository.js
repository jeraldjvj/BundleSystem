import { pool } from '../config/database.js';
import { HttpError } from '../utils/HttpError.js';

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
  async findAll({ userId, levelUser } = {}) {
    // Office Manager/admin → todas; City Manager → propias + equipo (head_in_charge);
    // otros → solo las propias
    const conditions = [];
    const params = [];
    if (levelUser !== 'Office Manager' && levelUser !== 'admin') {
      if (levelUser === 'City Manager') {
        conditions.push(`(bd.user_id = ? OR up.head_in_charge = (
          SELECT CONCAT(up2.first_name, ' ', up2.last_name)
          FROM user_profile up2 WHERE up2.user_id = ?
        ))`);
        params.push(userId, userId);
      } else {
        conditions.push('bd.user_id = ?');
        params.push(userId);
      }
    }
    const [rows] = await pool.query(`
      SELECT bd.${COLUMNS.split(', ').join(', bd.')}
      FROM bundle_delivered bd
      LEFT JOIN user u ON bd.user_id = u.user_id
      LEFT JOIN user_profile up ON u.user_id = up.user_id
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY bd.bundle_delivered_id
    `, params);
    return rows.map(toBundleDelivered);
  },

  async findById(bundleDeliveredId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle_delivered WHERE bundle_delivered_id = ?`, [bundleDeliveredId]);
    return rows.length ? toBundleDelivered(rows[0]) : null;
  },

  // ¿Puede este usuario ver una entrega ajena? OM/admin siempre; CM solo si el
  // entregador lo tiene como head_in_charge
  async canView(delivery, { userId, levelUser }) {
    if (levelUser === 'Office Manager' || levelUser === 'admin') return true;
    if (Number(delivery.userId) === Number(userId)) return true;
    if (levelUser !== 'City Manager') return false;
    const [rows] = await pool.query(
      `SELECT 1 FROM user_profile up
       WHERE up.user_id = ? AND up.head_in_charge = (
         SELECT CONCAT(up2.first_name, ' ', up2.last_name)
         FROM user_profile up2 WHERE up2.user_id = ?
       )`,
      [delivery.userId, userId]
    );
    return rows.length > 0;
  },

  async create({ user_id, bundle_id, smartphones_id, client_full_name, client_phone, client_picture, create_time, store_code, store_name }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Guard atómico: solo un request puede cambiar available → delivered.
      // Si dos llegan a la vez, el segundo afecta 0 filas y se revierte.
      const [guard] = await connection.query(
        `UPDATE bundle SET status = 'delivered' WHERE bundle_id = ? AND status = 'available'`,
        [bundle_id]
      );
      if (guard.affectedRows === 0) {
        await connection.rollback();
        throw new HttpError(409, 'Este bandeo ya fue entregado');
      }

      const [result] = await connection.query(
        'INSERT INTO bundle_delivered (user_id, bundle_id, smartphones_id, client_full_name, client_phone, client_picture, create_time, store_code, store_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, bundle_id, smartphones_id, client_full_name, client_phone, client_picture, create_time || new Date(), store_code, store_name],
      );

      await connection.query('UPDATE smartphones_database SET status = ? WHERE smartphones_id = ?', ['delivered', smartphones_id]);

      await connection.commit();
      return this.findById(result.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
