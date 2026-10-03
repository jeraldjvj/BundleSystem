import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';

const COLUMNS = 'id, name, description, price, items, created_at, updated_at';
const UPDATABLE_FIELDS = ['name', 'description', 'price', 'items'];

const toBundle = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toColumnValue = (field, value) => (field === 'items' ? JSON.stringify(value) : value);

export const bundleRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundles ORDER BY created_at DESC`);
    return rows.map(toBundle);
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM bundles WHERE id = ?`, [id]);
    return rows.length ? toBundle(rows[0]) : null;
  },

  async create({ name, description = null, price, items = [] }) {
    const id = randomUUID();
    await pool.query(
      'INSERT INTO bundles (id, name, description, price, items) VALUES (?, ?, ?, ?, ?)',
      [id, name, description, price, JSON.stringify(items)],
    );
    return this.findById(id);
  },

  async update(id, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE bundles SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`,
        [...fields.map((field) => toColumnValue(field, data[field])), id],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM bundles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
