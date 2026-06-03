import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createSwaggerSpec } from '@fems/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const swaggerSpec = createSwaggerSpec({
  title: 'FEMS Reporting Service',
  description: 'Cross-schema reports and PDF/CSV export',
  serverUrl: `http://localhost:${process.env.REPORTING_SERVICE_PORT || 3004}`,
  apis: [path.join(__dirname, 'paths.js')],
});
