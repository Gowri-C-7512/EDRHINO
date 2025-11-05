import { Options } from 'swagger-jsdoc';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EDRHINO',
      version: '1.0.0',
      description: 'API for authentication (login, register, etc.)',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header', // API key will be passed in the header
          name: 'Authorization', // Header name (can also be 'api_key')
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // path to your route files where Swagger comments exist
};
