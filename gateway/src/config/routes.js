import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

function serviceUrl(hostEnv, portEnv, defaultPort) {
  const host = process.env[hostEnv] || 'localhost';
  const port = process.env[portEnv] || defaultPort;
  return `http://${host}:${port}`;
}

export const services = {
  auth: {
    target: serviceUrl('AUTH_SERVICE_HOST', 'AUTH_SERVICE_PORT', 3001),
    pathRewrite: {},
  },
  extinguisher: {
    target: serviceUrl('EXTINGUISHER_SERVICE_HOST', 'EXTINGUISHER_SERVICE_PORT', 3002),
    pathRewrite: {},
  },
  inspection: {
    target: serviceUrl('INSPECTION_SERVICE_HOST', 'INSPECTION_SERVICE_PORT', 3003),
    pathRewrite: {},
  },
  reporting: {
    target: serviceUrl('REPORTING_SERVICE_HOST', 'REPORTING_SERVICE_PORT', 3004),
    pathRewrite: {},
  },
  notification: {
    target: serviceUrl('NOTIFICATION_SERVICE_HOST', 'NOTIFICATION_SERVICE_PORT', 3005),
    pathRewrite: {},
  },
};

export const publicRoutes = [
  '/api/auth/setup-admin',
  '/api/auth/login',
  '/api/auth/refresh-token',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp',
  '/api/auth/set-password',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/notifications/internal',
  '/health',
  '/api-docs',
];

export const routeMap = [
  { path: '/api/auth', service: 'auth', targetPrefix: '/auth' },
  { path: '/api/users', service: 'auth', targetPrefix: '/users' },
  { path: '/api/extinguishers', service: 'extinguisher', targetPrefix: '/extinguishers' },
  { path: '/api/inspections', service: 'inspection', targetPrefix: '/inspections' },
  { path: '/api/maintenance', service: 'inspection', targetPrefix: '/maintenance' },
  { path: '/api/reports', service: 'reporting', targetPrefix: '/reports' },
  { path: '/api/notifications', service: 'notification', targetPrefix: '/notifications' },
];
