import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const componentsPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'swaggerComponents.js'
);

export function createSwaggerSpec({ title, description, serverUrl, apis = [] }) {
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: { title, version: '1.0.0', description },
      servers: [{ url: serverUrl, description: title }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: [componentsPath, ...apis],
  });
}

export function mountSwagger(app, spec, route = '/api-docs') {
  app.use(route, swaggerUi.serve, swaggerUi.setup(spec, {
    customSiteTitle: spec.info?.title || 'FEMS API Docs',
  }));
}
