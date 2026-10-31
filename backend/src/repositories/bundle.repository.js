import { pool } from '../config/database.js';

const COLUMNS = 'bundle_id, project_id, user_id, serial_number, bundle_model_id, create_time, status';
const UPDATABLE_FIELDS = ['project_id', 'user_id', 'serial_number', 'bundle_model_id', 'create_time', 'status'];

const toBundle = (row) => ({
  bundleId: row.bundle_id,
  projectId: row.project_id,
  userId: row.user_id,
  serialNumber: row.serial_number,
  bundleModelId: row.bundle_model_id,
  createTime: row.create_time,
  status: row.status,
  projectName: row.project_name,
  bundleModelName: row.bundle_name,
  userFullName: row.user_full_name,
  userEmail: row.user_email,
  headInCharge: row.head_in_charge,
});

export const bundleRepository = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT b.${COLUMNS.split(', ').join(', b.')}, 
        p.project_name, 
        bm.bundle_name,
        CONCAT(up.first_name, ' ', up.last_name) as user_full_name,
        u.email as user_email,
        up.head_in_charge
      FROM bundle b
      LEFT JOIN project p ON b.project_id = p.project_id
      LEFT JOIN bundle_model bm ON b.bundle_model_id = bm.bundle_model_id
      LEFT JOIN user u ON b.user_id = u.user_id
      LEFT JOIN user_profile up ON u.user_id = up.user_id
      ORDER BY b.bundle_id
    `);
    return rows.map(toBundle);
  },

  async findById(bundleId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundle WHERE bundle_id = ?`, [bundleId]);
    return rows.length ? toBundle(rows[0]) : null;
  },

  async findBySerial(serialNumber) {
    const [rows] = await pool.query(`
      SELECT b.${COLUMNS.split(', ').join(', b.')},
        p.project_name,
        bm.bundle_name,
        CONCAT(up.first_name, ' ', up.last_name) as user_full_name,
        u.email as user_email,
        up.head_in_charge
      FROM bundle b
      LEFT JOIN project p ON b.project_id = p.project_id
      LEFT JOIN bundle_model bm ON b.bundle_model_id = bm.bundle_model_id
      LEFT JOIN user u ON b.user_id = u.user_id
      LEFT JOIN user_profile up ON u.user_id = up.user_id
      WHERE b.serial_number = ?
    `, [serialNumber]);
    return rows.length ? toBundle(rows[0]) : null;
  },

  async create({ project_id, user_id, serial_number, bundle_model_id, create_time }) {
    const [result] = await pool.query(
      'INSERT INTO bundle (project_id, user_id, serial_number, bundle_model_id, create_time) VALUES (?, ?, ?, ?, ?)',
      [project_id, user_id, serial_number, bundle_model_id, create_time || new Date()],
    );
    return this.findById(result.insertId);
  },

  async update(bundleId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE bundle SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE bundle_id = ?`,
        [...fields.map((field) => data[field]), bundleId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(bundleId);
  },

  async assign(bundleId, newUserId, managerUserId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query('SELECT user_id FROM bundle WHERE bundle_id = ?', [bundleId]);
      if (rows.length === 0) {
        await connection.rollback();
        return null;
      }
      const oldUserId = rows[0].user_id;

      await connection.query('UPDATE bundle SET user_id = ? WHERE bundle_id = ?', [newUserId, bundleId]);

      const [[{ maxId }]] = await connection.query('SELECT MAX(transfer_history_id) as maxId FROM transfer_history');
      await connection.query(
        'INSERT INTO transfer_history (transfer_history_id, bundle_id, old_user_id, new_user_id, manager_user_id, create_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [(maxId || 0) + 1, bundleId, oldUserId, newUserId, managerUserId || oldUserId, new Date(), 'completed'],
      );

      await connection.commit();
      return this.findById(bundleId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async remove(bundleId) {
    const [result] = await pool.query('DELETE FROM bundle WHERE bundle_id = ?', [bundleId]);
    return result.affectedRows > 0;
  },
};
