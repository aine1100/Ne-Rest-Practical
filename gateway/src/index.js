import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, errorHandler, mountSwagger } from '@fems/shared';
import { authMiddleware } from './middleware/auth.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import requestLogger from './middleware/logger.js';
import { setupProxies } from './proxy.js';
import { swaggerSpec } from '../swagger/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = parseInt(process.env.GATEWAY_PORT || '3000', 10);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3010',
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type'],
}));
app.use(express.json());
app.use(requestLogger);
app.use(generalLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gateway' });
});

app.get('/', (_req, res) => res.redirect('/api-docs'));

mountSwagger(app, swaggerSpec);

app.use('/api/auth', authLimiter);
app.use(authMiddleware);
setupProxies(app);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
});

export default app;
