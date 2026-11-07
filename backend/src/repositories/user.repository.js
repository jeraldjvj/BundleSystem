import { pool } from '../config/database.js';
import bcrypt from 'bcrypt';

// password_hash nunca se selecciona: no debe salir del servidor en ninguna respuesta
const COLUMNS = 'u.user_id, u.mi_id, u.email, u.status, u.level_user, u.create_time, u.updated_at, u.must_change_password, up.first_name, up.last_name, up.role_title, up.date_of_birth, up.city, up.head_in_charge, up.profile_picture';
const UPDATABLE_FIELDS = ['mi_id', 'email', 'password_hash', 'status', 'level_user'];
const PROFILE_FIELDS = ['first_name', 'last_name', 'role_title', 'date_of_birth', 'city', 'head_in_charge', 'profile_picture'];

const toUser = (row) => ({
  userId: row.user_id,
  miId: row.mi_id,
  email: row.email,
  status: row.status,
  levelUser: row.level_user,
  createTime: row.create_time,
  updatedAt: row.updated_at,
  mustChangePassword: Boolean(row.must_change_password),
  firstName: row.first_name,
  lastName: row.last_name,
  roleTitle: row.role_title,
  dateOfBirth: row.date_of_birth,
  city: row.city,
  headInCharge: row.head_in_charge,
  profilePicture: row.profile_picture,
});

export const userRepository = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM user u LEFT JOIN user_profile up ON u.user_id = up.user_id ORDER BY u.user_id`
    );
    return rows.map(toUser);
  },

  async findById(userId) {
    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM user u LEFT JOIN user_profile up ON u.user_id = up.user_id WHERE u.user_id = ?`,
      [userId]
    );
    return rows.length ? toUser(rows[0]) : null;
  },

  async findByMiId(miId) {
    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM user u LEFT JOIN user_profile up ON u.user_id = up.user_id WHERE u.mi_id = ?`,
      [miId]
    );
    return rows.length ? toUser(rows[0]) : null;
  },

  async create({ mi_id, email, password_hash, status = 'active', level_user = 'field force', first_name, last_name, role_title, date_of_birth, city, head_in_charge, profile_picture }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Hash the password with bcrypt (salt rounds = 10)
      const hashedPassword = await bcrypt.hash(password_hash, 10);
      
      const [result] = await connection.query(
        'INSERT INTO user (mi_id, email, password_hash, status, level_user) VALUES (?, ?, ?, ?, ?)',
        [mi_id, email, hashedPassword, status, level_user],
      );
      
      const userId = result.insertId;
      
      await connection.query(
        'INSERT INTO user_profile (user_id, first_name, last_name, role_title, date_of_birth, city, head_in_charge, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, first_name, last_name, role_title, date_of_birth, city, head_in_charge, profile_picture || null],
      );
      
      await connection.commit();
      return this.findById(userId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async update(userId, data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Update user table
      const userFields = UPDATABLE_FIELDS.filter((field) => data[field] !== undefined);
      const profileFields = PROFILE_FIELDS.filter((field) => data[field] !== undefined);
      if (userFields.length) {
        // If password is being updated, hash it
        if (data.password_hash) {
          data.password_hash = await bcrypt.hash(data.password_hash, 10);
        }
        
        // Una contraseña restablecida por el administrador es temporal:
        // el usuario deberá cambiarla en su próximo inicio de sesión
        const mustChange = data.password_hash ? `, must_change_password = ${data.password_temporary ? 1 : 0}` : '';
        await connection.query(
          `UPDATE user SET ${userFields.map((field) => `${field} = ?`).join(', ')}${mustChange}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
          [...userFields.map((field) => data[field]), userId],
        );
      } else if (profileFields.length) {
        // Solo cambiaron datos del perfil: igual se marca updated_at en user
        await connection.query(
          'UPDATE user SET updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
          [userId],
        );
      }
      
      // Update user_profile table
      if (profileFields.length) {
        // Check if profile exists
        const [existingProfile] = await connection.query(
          'SELECT user_id FROM user_profile WHERE user_id = ?',
          [userId]
        );
        
        if (existingProfile.length > 0) {
          await connection.query(
            `UPDATE user_profile SET ${profileFields.map((field) => `${field} = ?`).join(', ')} WHERE user_id = ?`,
            [...profileFields.map((field) => data[field]), userId],
          );
        } else {
          await connection.query(
            'INSERT INTO user_profile (user_id, first_name, last_name, role_title, date_of_birth, city, head_in_charge, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, data.first_name, data.last_name, data.role_title, data.date_of_birth, data.city, data.head_in_charge, data.profile_picture || null],
          );
        }
      }
      
      await connection.commit();
      return this.findById(userId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async remove(userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      await connection.query('DELETE FROM user_profile WHERE user_id = ?', [userId]);
      const [result] = await connection.query('DELETE FROM user WHERE user_id = ?', [userId]);
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};
