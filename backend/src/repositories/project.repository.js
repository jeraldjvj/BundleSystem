import { pool } from '../config/database.js';

const COLUMNS = 'project_id, project_name, start_date, status, create_time';
const UPDATABLE_FIELDS = ['project_name', 'start_date', 'status'];

const toProject = (row) => ({
  projectId: row.project_id,
  projectName: row.project_name,
  startDate: row.start_date,
  status: row.status,
  createTime: row.create_time,
});

export const projectRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM project ORDER BY project_id`);
    return rows.map(toProject);
  },

  async findById(projectId) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM project WHERE project_id = ?`, [projectId]);
    return rows.length ? toProject(rows[0]) : null;
  },

  async create({ project_name, start_date, status = 'active' }) {
    const [result] = await pool.query(
      'INSERT INTO project (project_name, start_date, status) VALUES (?, ?, ?)',
      [project_name, start_date, status],
    );
    return this.findById(result.insertId);
  },

  async update(projectId, data) {
    const fields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
    if (fields.length) {
      const [result] = await pool.query(
        `UPDATE project SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE project_id = ?`,
        [...fields.map((field) => data[field]), projectId],
      );
      if (result.affectedRows === 0) return null;
    }
    return this.findById(projectId);
  },

  async remove(projectId) {
    const [result] = await pool.query('DELETE FROM project WHERE project_id = ?', [projectId]);
    return result.affectedRows > 0;
  },
};
