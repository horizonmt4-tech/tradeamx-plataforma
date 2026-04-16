/**
 * bump-version.js
 * Genera un hash único en public/version.json antes de cada build.
 * Esto permite que useAutoUpdate.js detecte correctamente los deploys nuevos.
 *
 * Uso: se ejecuta automáticamente con "npm run build"
 * No requiere dependencias externas.
 */
import { writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/version.json');

const timestamp = new Date().toISOString();
const hash = createHash('sha256')
  .update(timestamp + Math.random().toString())
  .digest('hex')
  .substring(0, 16);

const versionData = {
  timestamp,
  version: '1.0.0',
  hash,
};

writeFileSync(outputPath, JSON.stringify(versionData, null, 2));
console.log(`[bump-version] Nuevo hash generado: ${hash} (${timestamp})`);