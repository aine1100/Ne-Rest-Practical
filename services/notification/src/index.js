import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, errorHandler, notFoundHandler, mountSwagger } from '@fems/shared';
import { initSchemas } from '@fems/db';
import notificationRoutes from './routes/notification.routes.js';
import { runAllNotificationJobs } from './services/cron.service.js';
import { swaggerSpec } from '../swagger/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();
const PORT = parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3005', 10);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'notification' });
});

mountSwagger(app, swaggerSpec);

app.use('/notifications', notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function runScheduledJobs(label) {
  try {
    await runAllNotificationJobs();
    logger.info(`Notification jobs completed (${label})`);
  } catch (err) {
    logger.error(`Notification cron failed (${label}): ${err.message}`);
  }
}

// Every 5 minutes — scan DB for expiry and inspection reminders
cron.schedule('*/5 * * * *', () => runScheduledJobs('every-5-min'));

async function start() {
  await initSchemas();
  app.listen(PORT, () => {
    logger.info(`Notification service running on port ${PORT}`);
    logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
    setTimeout(() => runScheduledJobs('startup'), 15000);
  });
}

start();

export default app;
