import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { services, routeMap } from './config/routes.js';

function createServiceProxy(serviceName, targetPrefix) {
  const service = services[serviceName];

  return createProxyMiddleware({
    target: service.target,
    changeOrigin: true,
    pathRewrite: (path) => `${targetPrefix}${path}`,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.headers['x-user-id']) {
          proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
          proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
          proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
        }

        fixRequestBody(proxyReq, req);
      },
      error: (err, req, res) => {
        console.error(`Proxy error for ${req.path}:`, err.message);
        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            message: `Service unavailable: ${serviceName}`,
          });
        }
      },
    },
  });
}

export function setupProxies(app) {
  for (const route of routeMap) {
    app.use(route.path, createServiceProxy(route.service, route.targetPrefix));
  }
}
