import mysql from 'mysql2/promise';
import config from './index.js';

export const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  decimalNumbers: true,
});

export const testConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
};
