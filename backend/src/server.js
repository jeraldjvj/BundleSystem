import app from './app.js';
import config from './config/index.js';
import { pool, testConnection } from './config/database.js';
import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';

try {
  await testConnection();
  console.log(`Connected to MySQL at ${config.db.host}:${config.db.port}/${config.db.database}`);
} catch (err) {
  console.error('Could not connect to MySQL:', err.message || err.code);
  process.exit(1);
}

// Si hay certificado configurado el API corre en HTTPS; si no, en HTTP
let server;
if (process.env.HTTPS_KEY_PATH && process.env.HTTPS_CERT_PATH) {
  const credentials = {
    key: fs.readFileSync(process.env.HTTPS_KEY_PATH),
    cert: fs.readFileSync(process.env.HTTPS_CERT_PATH),
  };
  server = https.createServer(credentials, app);
  console.log('HTTPS habilitado con certificado propio');
} else {
  server = http.createServer(app);
}

server.listen(config.port, () => {
  const scheme = process.env.HTTPS_KEY_PATH ? 'https' : 'http';
  console.log(`API running on ${scheme}://localhost:${config.port}${config.apiPrefix} (${config.env})`);
});

const shutdown = () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
