import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

dotenv.config({ path: path.join(ROOT, '.env') });

export const FEMS_SCHEMAS = ['auth', 'extinguisher', 'inspection', 'notification'];

export const DUMP_DIR = path.join(ROOT, 'database', 'dumps');
export const DEFAULT_DUMP_FILE = path.join(DUMP_DIR, 'fems.sql');

export function getDbConfig() {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = process.env.DATABASE_PORT || '5432';
  const user = process.env.DATABASE_USER || 'postgres';
  const password = process.env.DATABASE_PASSWORD || '';
  const database = process.env.DATABASE_NAME || 'fems';

  return { host, port, user, password, database };
}

export function ensureDumpDir() {
  if (!fs.existsSync(DUMP_DIR)) {
    fs.mkdirSync(DUMP_DIR, { recursive: true });
  }
}

export function resolvePgTool(name) {
  const fromPath = process.env[`PG_${name.toUpperCase()}_PATH`];
  if (fromPath && fs.existsSync(fromPath)) return fromPath;

  const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
  const postgresRoot = path.join(programFiles, 'PostgreSQL');

  if (fs.existsSync(postgresRoot)) {
    const matches = fs
      .readdirSync(postgresRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(postgresRoot, entry.name, 'bin', `${name}.exe`))
      .filter((candidate) => fs.existsSync(candidate))
      .sort()
      .reverse();

    if (matches.length) return matches[0];
  }

  return name;
}

export function timestampedDumpPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return path.join(DUMP_DIR, `fems-${stamp}.sql`);
}
