import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createSwaggerSpec } from '@fems/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const swaggerSpec = createSwaggerSpec({
  title: 'FEMS Extinguisher Service',
  description: 'Fire extinguisher inventory CRUD and validation',
  serverUrl: `http://localhost:${process.env.EXTINGUISHER_SERVICE_PORT || 3002}`,
  apis: [path.join(__dirname, 'paths.js')],
});
