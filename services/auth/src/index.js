import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  logger,
  errorHandler,
  notFoundHandler,
  mountSwagger,
} from '@fems/shared';
import { initSchemas } from '@fems/db';
import config from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { swaggerSpec } from '../swagger/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth' });
});

mountSwagger(app, swaggerSpec);

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await initSchemas();
    logger.info('Auth schema initialized');

    app.listen(config.port, () => {
      logger.info(`Auth service running on port ${config.port}`);
      logger.info(`Swagger docs at http://localhost:${config.port}/api-docs`);
    });
  } catch (err) {
    logger.error(`Failed to start auth service: ${err.message}`);
    process.exit(1);
  }
}

start();

export default app;
