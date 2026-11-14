import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const logsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../logs');
fs.mkdirSync(logsDir, { recursive: true });
const logFile = path.join(logsDir, 'auth.log');
const MAX_LOG_BYTES = 5 * 1024 * 1024;

// Rotación simple: si el log pasa de 5MB se guarda como auth.log.1
const rotateIfNeeded = () => {
  try {
    if (fs.statSync(logFile).size > MAX_LOG_BYTES) {
      fs.renameSync(logFile, `${logFile}.1`);
    }
  } catch { /* si no existe aún, no hay nada que rotar */ }
};

// Registra cada intento de login para poder detectar ataques en curso
export const logAuthEvent = (req, identifier, result, detail = '') => {
  // La IP sale del socket real: el header X-Forwarded-For lo puede falsificar el cliente
  const ip = req.socket?.remoteAddress || 'unknown';
  // Sin saltos de línea: evita inyectar entradas falsas en el log
  const safeId = String(identifier ?? '').replace(/[\r\n]/g, ' ').slice(0, 255);
  const line = `${new Date().toISOString()} | ip=${ip} | usuario=${safeId} | resultado=${result}${detail ? ` | ${detail}` : ''}\n`;
  rotateIfNeeded();
  fs.appendFile(logFile, line, () => {});
};
