import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createSwaggerSpec } from '@fems/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const swaggerSpec = createSwaggerSpec({
  title: 'FEMS API Gateway',
  description: 'Aggregated Fire Extinguisher Management System API — all routes proxied through the gateway',
  serverUrl: `http://localhost:${process.env.GATEWAY_PORT || 3000}`,
  apis: [path.join(__dirname, 'paths.js')],
});
