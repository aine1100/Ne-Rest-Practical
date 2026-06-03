import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Database setup is handled by Drizzle migrations, not this script.');
console.log('');
console.log('First-time setup:');
console.log('  1. npm run db:generate   # create migration SQL from schema (if none exists)');
console.log('  2. npm run db:migrate    # apply migrations → creates schemas + tables');
console.log('');
console.log('Backup / restore:');
console.log('  npm run db:export        # save DB to database/dumps/fems.sql');
console.log('  npm run db:import        # restore from database/dumps/fems.sql');
console.log('');
console.log('Then create the first admin: POST /api/auth/setup-admin');
