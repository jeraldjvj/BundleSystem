import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { HttpError } from '../utils/HttpError.js';

const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXT_BY_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = EXT_BY_MIME[file.mimetype] || '.jpg';
    cb(null, `client_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

export const uploadPicture = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new HttpError(422, 'Solo se permiten imágenes (jpg, png, webp, gif)'));
    }
    cb(null, true);
  },
});
