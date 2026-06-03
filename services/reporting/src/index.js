import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, errorHandler, notFoundHandler, mountSwagger } from '@fems/shared';
import reportRoutes from './routes/report.routes.js';
import { swaggerSpec } from '../swagger/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();
const PORT = parseInt(process.env.REPORTING_SERVICE_PORT || '3004', 10);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'reporting' });
});

mountSwagger(app, swaggerSpec);

app.use('/reports', reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Reporting service running on port ${PORT}`);
  logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
});

export default app;
