import { spawnSync } from 'child_process';
import fs from 'fs';
import {
  DEFAULT_DUMP_FILE,
  FEMS_SCHEMAS,
  ensureDumpDir,
  getDbConfig,
  resolvePgTool,
  timestampedDumpPath,
} from './db-utils.js';

const keepCopy = process.argv.includes('--copy');
const outputArg = process.argv.find((arg) => arg.startsWith('--out='));
const outputFile = outputArg ? outputArg.slice('--out='.length) : DEFAULT_DUMP_FILE;

ensureDumpDir();

const { host, port, user, password, database } = getDbConfig();
const pgDump = resolvePgTool('pg_dump');

const args = [
  '--host',
  host,
  '--port',
  String(port),
  '--username',
  user,
  '--dbname',
  database,
  '--format=plain',
  '--encoding=UTF8',
  '--no-owner',
  '--no-acl',
  '--clean',
  '--if-exists',
  '--file',
  outputFile,
  ...FEMS_SCHEMAS.flatMap((schema) => ['--schema', schema]),
];

const result = spawnSync(pgDump, args, {
  env: { ...process.env, PGPASSWORD: password },
  encoding: 'utf8',
});

if (result.error) {
  console.error('Failed to run pg_dump:', result.error.message);
  console.error('Install PostgreSQL client tools or set PG_PG_DUMP_PATH in .env');
  process.exit(1);
}

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'pg_dump failed');
  process.exit(result.status || 1);
}

const stats = fs.statSync(outputFile);
console.log(`Database exported to ${outputFile}`);
console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);
console.log(`  Schemas: ${FEMS_SCHEMAS.join(', ')}`);

if (keepCopy && outputFile === DEFAULT_DUMP_FILE) {
  const copyPath = timestampedDumpPath();
  fs.copyFileSync(outputFile, copyPath);
  console.log(`  Backup copy: ${copyPath}`);
}
