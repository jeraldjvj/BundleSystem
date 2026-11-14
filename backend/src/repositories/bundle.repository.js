import { pool } from '../config/database.js';

const COLUMNS = 'bundle_id, project_id, user_id, serial_number, bundle_model_id, create_time, status';
// user_id y status solo cambian por asignación/transferencia/entrega,
// nunca por un PATCH directo (mantener el registro de auditoría)
const UPDATABLE_FIELDS = ['project_id', 'serial_number', 'bundle_model_id', 'create_time'];

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
  async findAll({ userId, levelUser } = {}) {
    // Alcance por rol aplicado en el servidor:
    // Office Manager/admin → todos; City Manager → propios + equipo (head_in_charge);
    // otros → solo los propios
    const conditions = [];
    const params = [];
    if (levelUser !== 'Office Manager' && levelUser !== 'admin') {
      if (levelUser === 'City Manager') {
        conditions.push('(b.user_id = ? OR up.head_in_charge = (SELECT CONCAT(up2.first_name, " ", up2.last_name) FROM user_profile up2 WHERE up2.user_id = ?))');
        params.push(userId, userId);
      } else {
        conditions.push('b.user_id = ?');
        params.push(userId);
      }
    }
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
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY b.bundle_id
    `, params);
    return rows.map(toBundle);
  },

  async findById(bundleId) {
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
      WHERE b.bundle_id = ?
    `, [bundleId]);
    return rows.length ? toBundle(rows[0]) : null;
  },

  // ¿Puede este usuario ver un bandeo ajeno? OM/admin siempre; CM solo si el
  // dueño lo tiene como head_in_charge
  async canView(bundle, { userId, levelUser }) {
    if (levelUser === 'Office Manager' || levelUser === 'admin') return true;
    if (Number(bundle.userId) === Number(userId)) return true;
    if (levelUser !== 'City Manager') return false;
    const [rows] = await pool.query(
      `SELECT 1 FROM user_profile up
       WHERE up.user_id = ? AND up.head_in_charge = (
         SELECT CONCAT(up2.first_name, ' ', up2.last_name)
         FROM user_profile up2 WHERE up2.user_id = ?
       )`,
      [bundle.userId, userId]
    );
    return rows.length > 0;
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

  async requestTransfer(bundleId, newUserId, managerUserId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Lock sobre la fila del bandeo: evita dos transferencias simultáneas
      const [rows] = await connection.query(
        'SELECT user_id, status FROM bundle WHERE bundle_id = ? FOR UPDATE',
        [bundleId]
      );
      if (rows.length === 0) {
        await connection.rollback();
        return { error: 'Bundle not found' };
      }
      const bundle = rows[0];
      if (String(bundle.user_id) !== String(managerUserId)) {
        await connection.rollback();
        return { error: 'El bandeo no está asignado a tu usuario' };
      }
      if (bundle.status !== 'available') {
        await connection.rollback();
        return { error: 'Solo se pueden transferir bandeos disponibles' };
      }
      if (String(bundle.user_id) === String(newUserId)) {
        await connection.rollback();
        return { error: 'No puedes transferir el bandeo a ti mismo' };
      }
      const [target] = await connection.query(
        `SELECT status FROM user WHERE user_id = ?`, [newUserId]
      );
      if (target.length === 0) {
        await connection.rollback();
        return { error: 'Usuario destino no encontrado' };
      }
      if (String(target[0].status).toLowerCase() !== 'active') {
        await connection.rollback();
        return { error: 'El usuario destino está inactivo' };
      }
      const [[pending]] = await connection.query(
        `SELECT COUNT(*) AS c FROM transfer_history WHERE bundle_id = ? AND status = 'transfering'`,
        [bundleId]
      );
      if (pending.c > 0) {
        await connection.rollback();
        return { error: 'Ya hay una transferencia pendiente para este bandeo' };
      }

      const [[{ maxId }]] = await connection.query('SELECT MAX(transfer_history_id) as maxId FROM transfer_history');
      const [result] = await connection.query(
        'INSERT INTO transfer_history (transfer_history_id, bundle_id, old_user_id, new_user_id, manager_user_id, create_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [(maxId || 0) + 1, bundleId, managerUserId, newUserId, managerUserId, new Date(), 'transfering'],
      );
      await connection.commit();
      return { transferHistoryId: result.insertId || (maxId || 0) + 1 };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async findPendingTransfersFor(userId) {
    const [rows] = await pool.query(`
      SELECT th.transfer_history_id, th.bundle_id, th.old_user_id, th.new_user_id, th.create_time,
        b.serial_number, bm.bundle_name,
        CONCAT(up.first_name, ' ', up.last_name) AS from_user_name
      FROM transfer_history th
      LEFT JOIN bundle b ON th.bundle_id = b.bundle_id
      LEFT JOIN bundle_model bm ON b.bundle_model_id = bm.bundle_model_id
      LEFT JOIN user u ON th.old_user_id = u.user_id
      LEFT JOIN user_profile up ON u.user_id = up.user_id
      WHERE th.new_user_id = ? AND th.status = 'transfering'
      ORDER BY th.create_time DESC
    `, [userId]);
    return rows;
  },

  async findOutgoingPendingTransfers(userId) {
    const [rows] = await pool.query(`
      SELECT th.transfer_history_id, th.bundle_id, th.old_user_id, th.new_user_id, th.create_time,
        b.serial_number, bm.bundle_name,
        CONCAT(up.first_name, ' ', up.last_name) AS to_user_name
      FROM transfer_history th
      LEFT JOIN bundle b ON th.bundle_id = b.bundle_id
      LEFT JOIN bundle_model bm ON b.bundle_model_id = bm.bundle_model_id
      LEFT JOIN user u ON th.new_user_id = u.user_id
      LEFT JOIN user_profile up ON u.user_id = up.user_id
      WHERE th.old_user_id = ? AND th.status = 'transfering'
      ORDER BY th.create_time DESC
    `, [userId]);
    return rows;
  },

  async findTransferHistory(userId) {
    const [rows] = await pool.query(`
      SELECT th.transfer_history_id, th.bundle_id, th.old_user_id, th.new_user_id,
        th.manager_user_id, th.create_time, th.status,
        b.serial_number, bm.bundle_name,
        CONCAT(up_old.first_name, ' ', up_old.last_name) AS from_user_name,
        CONCAT(up_new.first_name, ' ', up_new.last_name) AS to_user_name
      FROM transfer_history th
      LEFT JOIN bundle b ON th.bundle_id = b.bundle_id
      LEFT JOIN bundle_model bm ON b.bundle_model_id = bm.bundle_model_id
      LEFT JOIN user_profile up_old ON th.old_user_id = up_old.user_id
      LEFT JOIN user_profile up_new ON th.new_user_id = up_new.user_id
      WHERE th.old_user_id = ? OR th.new_user_id = ?
      ORDER BY th.create_time DESC
    `, [userId, userId]);
    return rows;
  },

  async findAllTransferHistory() {
    const [rows] = await pool.query(`
      SELECT th.transfer_history_id, th.bundle_id, th.old_user_id, th.new_user_id,
        th.manager_user_id, th.create_time, th.status,
        b.serial_number, bm.bundle_name,
        u_old.mi_id AS from_mi_id,
        u_new.mi_id AS to_mi_id,
        u_mgr.mi_id AS manager_mi_id,
        CONCAT(up_old.first_name, ' ', up_old.last_name) AS from_user_name,
        CONCAT(up_new.first_name, ' ', up_new.last_name) AS to_user_name,
        CONCAT(up_mgr.first_name, ' ', up_mgr.last_name) AS manager_user_name
      FROM transfer_history th
      LEFT JOIN bundle b ON th.bundle_id = b.bundle_id
      LEFT JOIN bundle_model bm ON b.bundle_model_id = bm.bundle_model_id
      LEFT JOIN user u_old ON th.old_user_id = u_old.user_id
      LEFT JOIN user u_new ON th.new_user_id = u_new.user_id
      LEFT JOIN user u_mgr ON th.manager_user_id = u_mgr.user_id
      LEFT JOIN user_profile up_old ON th.old_user_id = up_old.user_id
      LEFT JOIN user_profile up_new ON th.new_user_id = up_new.user_id
      LEFT JOIN user_profile up_mgr ON th.manager_user_id = up_mgr.user_id
      ORDER BY th.create_time DESC
    `);
    return rows;
  },

  async cancelTransfer(transferHistoryId, userId) {
    const [rows] = await pool.query(
      `SELECT * FROM transfer_history WHERE transfer_history_id = ? AND status = 'transfering'`,
      [transferHistoryId]
    );
    if (rows.length === 0) return { error: 'Transferencia no encontrada o ya resuelta' };
    const transfer = rows[0];
    if (String(transfer.old_user_id) !== String(userId)) {
      return { error: 'No eres quien envió esta transferencia' };
    }
    await pool.query(
      `UPDATE transfer_history SET status = 'canceled' WHERE transfer_history_id = ?`,
      [transferHistoryId]
    );
    return { ok: true };
  },

  async resolveTransfer(transferHistoryId, userId, approve) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(
        `SELECT * FROM transfer_history WHERE transfer_history_id = ? AND status = 'transfering'`,
        [transferHistoryId]
      );
      if (rows.length === 0) {
        await connection.rollback();
        return { error: 'Transferencia no encontrada o ya resuelta' };
      }
      const transfer = rows[0];
      if (String(transfer.new_user_id) !== String(userId)) {
        await connection.rollback();
        return { error: 'No eres el destinatario de esta transferencia' };
      }
      if (approve) {
        await connection.query('UPDATE bundle SET user_id = ? WHERE bundle_id = ?', [transfer.new_user_id, transfer.bundle_id]);
        await connection.query(`UPDATE transfer_history SET status = 'completed' WHERE transfer_history_id = ?`, [transferHistoryId]);
      } else {
        await connection.query(`UPDATE transfer_history SET status = 'rejected' WHERE transfer_history_id = ?`, [transferHistoryId]);
      }
      await connection.commit();
      return { ok: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};
