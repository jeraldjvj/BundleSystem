/**
 * Script de mantenimiento: detecta imágenes huérfanas en el volumen de uploads.
 *
 * Una imagen es huérfana si existe en disco pero ninguna fila de la BD la referencia
 * (bundle_delivered.client_picture o user.profile_picture). Esto ocurre cuando:
 *  - Se elimina una entrega (el registro se borra pero el archivo no)
 *  - Falla la creación de una entrega después de subir la foto
 *
 * Uso:
 *   node scripts/clean-orphan-images.js           → solo reporta (dry-run, no borra nada)
 *   node scripts/clean-orphan-images.js --delete  → reporta y elimina los archivos huérfanos
 */

import fs from 'node:fs';
import path from 'node:path';
import { pool } from '../src/config/database.js';

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/app/backend/uploads';
const shouldDelete = process.argv.includes('--delete');

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

const run = async () => {
  console.log('Buscando imágenes referenciadas en la base de datos...');

  const [deliveries] = await pool.query('SELECT client_picture FROM bundle_delivered');
  const [users] = await pool.query('SELECT profile_picture FROM user_profile WHERE profile_picture IS NOT NULL');

  const referenced = new Set();
  for (const row of deliveries) {
    if (row.client_picture) referenced.add(path.basename(row.client_picture));
  }
  for (const row of users) {
    if (row.profile_picture) referenced.add(path.basename(row.profile_picture));
  }

  console.log(`  ${referenced.size} imágenes referenciadas en la BD`);
  console.log(`Leyendo archivos en ${UPLOADS_DIR}...`);

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error(`ERROR: no existe el directorio ${UPLOADS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR).filter((f) => fs.statSync(path.join(UPLOADS_DIR, f)).isFile());
  console.log(`  ${files.length} archivos en disco\n`);

  const orphans = [];
  let orphanBytes = 0;
  let totalBytes = 0;

  for (const file of files) {
    const size = fs.statSync(path.join(UPLOADS_DIR, file)).size;
    totalBytes += size;
    if (!referenced.has(file)) {
      orphans.push({ file, size });
      orphanBytes += size;
    }
  }

  console.log(`Total en disco:        ${files.length} archivos (${formatSize(totalBytes)})`);
  console.log(`En uso por la BD:      ${files.length - orphans.length} archivos`);
  console.log(`Huérfanas:             ${orphans.length} archivos (${formatSize(orphanBytes)})\n`);

  if (orphans.length === 0) {
    console.log('No hay imágenes huérfanas. Todo limpio.');
    await pool.end();
    return;
  }

  for (const { file, size } of orphans) {
    console.log(`  ${file}  (${formatSize(size)})`);
  }

  if (shouldDelete) {
    console.log('\nEliminando archivos huérfanos...');
    let deleted = 0;
    for (const { file } of orphans) {
      try {
        fs.unlinkSync(path.join(UPLOADS_DIR, file));
        deleted++;
      } catch (err) {
        console.error(`  ERROR al eliminar ${file}: ${err.message}`);
      }
    }
    console.log(`\n${deleted}/${orphans.length} archivos eliminados. Espacio liberado: ${formatSize(orphanBytes)}`);
  } else {
    console.log('\nModo dry-run: no se eliminó nada.');
    console.log('Para eliminar estos archivos ejecuta: node scripts/clean-orphan-images.js --delete');
  }

  await pool.end();
};

run().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
