import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, errorHandler, notFoundHandler, mountSwagger } from '@fems/shared';
import { initSchemas } from '@fems/db';
import inspectionRoutes from './routes/inspection.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import { markOverdueInspections } from './services/inspection.service.js';
import { swaggerSpec } from '../swagger/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();
const PORT = parseInt(process.env.INSPECTION_SERVICE_PORT || '3003', 10);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'inspection' });
});

mountSwagger(app, swaggerSpec);

app.use('/inspections', inspectionRoutes);
app.use('/maintenance', maintenanceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

cron.schedule('0 0 * * *', async () => {
  try {
    const count = await markOverdueInspections();
    logger.info(`Marked ${count} inspections as overdue`);
  } catch (err) {
    logger.error(`Overdue cron failed: ${err.message}`);
  }
});

async function start() {
  await initSchemas();
  app.listen(PORT, () => {
    logger.info(`Inspection service running on port ${PORT}`);
    logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
}

start();

export default app;
