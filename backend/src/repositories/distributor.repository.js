import { pool } from '../config/database.js';

const COLUMNS = 'distributor_id, distributor_name';
const UPDATABLE_FIELDS = ['distributor_name'];

const toDistributor = (row) => ({
  distributorId: row.distributor_id,
  distributorName: row.distributor_name,
});

export const distributorRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM distributor ORDER BY distributor_id`);
    return rows.map(toDistributor);
  },

  async findById(distributorId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM distributor WHERE distributor_id = ?`, [distributorId]);
    return rows.length ? toDistributor(rows[0]) : null;
  },

  async create({ distributor_name }) {
    const [[{ nextId }]] = await pool.query(
      'SELECT COALESCE(MAX(distributor_id), 0) + 1 AS nextId FROM distributor',
    );
    await pool.query(
      'INSERT INTO distributor (distributor_id, distributor_name) VALUES (?, ?)',
      [nextId, distributor_name],
    );
    return this.findById(nextId);
  },

  async update(distributorId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE distributor SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE distributor_id = ?`,
        [...fields.map((field) => data[field]), distributorId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(distributorId);
  },

  async remove(distributorId) {
    const [result] = await pool.query('DELETE FROM distributor WHERE distributor_id = ?', [distributorId]);
    return result.affectedRows > 0;
  },
};
