import 'dotenv/config';
import { sql } from '@fems/db';

try {
  const [row] = await sql`SELECT version() AS version, current_database() AS db`;
  console.log('Database connection OK');
  console.log('  Engine: PostgreSQL');
  console.log('  Database:', row.db);
  console.log('  URL host:', process.env.DATABASE_HOST, 'port:', process.env.DATABASE_PORT);
  process.exit(0);
} catch (err) {
  console.error('Database connection FAILED');
  console.error('  Message:', err.message);
  console.error('');
  console.error('Expected setup from .env:');
  console.error('  Host:', process.env.DATABASE_HOST || '(not set)');
  console.error('  Port:', process.env.DATABASE_PORT || '(not set)');
  console.error('  User:', process.env.DATABASE_USER || '(not set)');
  console.error('  Database:', process.env.DATABASE_NAME || '(not set)');
  process.exit(1);
}
