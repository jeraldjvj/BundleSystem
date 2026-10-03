import app from './app.js';
import config from './config/index.js';
import { pool, testConnection } from './config/database.js';

try {
  await testConnection();
  console.log(`Connected to MySQL at ${config.db.host}:${config.db.port}/${config.db.database}`);
} catch (err) {
  console.error('Could not connect to MySQL:', err.message || err.code);
  process.exit(1);
}

const server = app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}${config.apiPrefix} (${config.env})`);
});

const shutdown = () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
