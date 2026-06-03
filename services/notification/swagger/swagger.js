import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createSwaggerSpec } from '@fems/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const swaggerSpec = createSwaggerSpec({
  title: 'FEMS Notification Service',
  description: 'In-app notifications and email alerts',
  serverUrl: `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || 3005}`,
  apis: [path.join(__dirname, 'paths.js')],
});
