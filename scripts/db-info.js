import 'dotenv/config';
import { sql } from '@fems/db';

const schemas = await sql`
  SELECT schema_name
  FROM information_schema.schemata
  WHERE schema_name IN ('auth', 'extinguisher', 'inspection', 'notification')
  ORDER BY schema_name
`;

const tables = await sql`
  SELECT table_schema, table_name
  FROM information_schema.tables
  WHERE table_schema IN ('auth', 'extinguisher', 'inspection', 'notification')
  ORDER BY table_schema, table_name
`;

console.log('PostgreSQL database: fems\n');
console.log('Schemas found:', schemas.map((s) => s.schema_name).join(', ') || '(none)');
console.log('\nTables:');
for (const t of tables) {
  console.log(`  ${t.table_schema}.${t.table_name}`);
}

const cols = await sql`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'inspection' AND table_name = 'inspections'
    AND column_name IN ('status_before', 'status_after', 'findings')
  ORDER BY column_name
`;
console.log('\nInspection snapshot columns:', cols.map((c) => c.column_name).join(', ') || '(missing — run migrations)');
