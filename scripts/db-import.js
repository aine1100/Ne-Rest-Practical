import { spawnSync } from 'child_process';
import fs from 'fs';
import { DEFAULT_DUMP_FILE, getDbConfig, resolvePgTool } from './db-utils.js';

const inputArg = process.argv.find((arg) => arg.startsWith('--file='));
const inputFile = inputArg ? inputArg.slice('--file='.length) : DEFAULT_DUMP_FILE;

if (!fs.existsSync(inputFile)) {
  console.error(`Dump file not found: ${inputFile}`);
  console.error('Run: npm run db:export');
  process.exit(1);
}

const { host, port, user, password, database } = getDbConfig();
const psql = resolvePgTool('psql');

const args = [
  '--host',
  host,
  '--port',
  String(port),
  '--username',
  user,
  '--dbname',
  database,
  '--file',
  inputFile,
  '--single-transaction',
  '--set',
  'ON_ERROR_STOP=1',
];

console.log(`Restoring database from ${inputFile}...`);

const result = spawnSync(psql, args, {
  env: { ...process.env, PGPASSWORD: password },
  encoding: 'utf8',
});

if (result.error) {
  console.error('Failed to run psql:', result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'Restore failed');
  process.exit(result.status || 1);
}

console.log('Database restored successfully.');
