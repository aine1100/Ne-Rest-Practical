import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createSwaggerSpec } from '@fems/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const swaggerSpec = createSwaggerSpec({
  title: 'FEMS Inspection Service',
  description: 'Inspection scheduling and maintenance logging',
  serverUrl: `http://localhost:${process.env.INSPECTION_SERVICE_PORT || 3003}`,
  apis: [path.join(__dirname, 'paths.js')],
});
