import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createSwaggerSpec } from '@fems/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const swaggerSpec = createSwaggerSpec({
  title: 'FEMS Auth Service',
  description: 'Authentication, OTP, and user management API',
  serverUrl: `http://localhost:${process.env.AUTH_SERVICE_PORT || 3001}`,
  apis: [path.join(__dirname, 'paths.js')],
});
