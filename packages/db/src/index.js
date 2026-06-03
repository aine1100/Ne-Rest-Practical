import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment');
}

export const client = postgres(connectionString, { max: 10 });
export const sql = client;
export const db = drizzle(client, { schema });

export async function initSchemas() {
  await client`CREATE SCHEMA IF NOT EXISTS auth`;
  await client`CREATE SCHEMA IF NOT EXISTS extinguisher`;
  await client`CREATE SCHEMA IF NOT EXISTS inspection`;
  await client`CREATE SCHEMA IF NOT EXISTS notification`;
}

export * from './schema/index.js';
