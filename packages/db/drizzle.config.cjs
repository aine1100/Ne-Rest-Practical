const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: './src/schema/index.js',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schemaFilter: ['auth', 'extinguisher', 'inspection', 'notification'],
};
