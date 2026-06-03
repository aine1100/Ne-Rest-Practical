import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, errorHandler, notFoundHandler, mountSwagger } from '@fems/shared';
import { initSchemas } from '@fems/db';
import extinguisherRoutes from './routes/extinguisher.routes.js';
import { swaggerSpec } from '../swagger/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();
const PORT = parseInt(process.env.EXTINGUISHER_SERVICE_PORT || '3002', 10);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'extinguisher' });
});

mountSwagger(app, swaggerSpec);

app.use('/extinguishers', extinguisherRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await initSchemas();
  app.listen(PORT, () => {
    logger.info(`Extinguisher service running on port ${PORT}`);
    logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
}

start();

export default app;
