import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tuk-Tuk Tracking API',
            version: '1.0.0',
            description: 'API documentation for the Sri Lanka Police Tuk-Tuk Tracking System',
        },
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
    apis: ['./src/routes/*.js'], // Tells Swagger to read the comments in your route files
};

export const swaggerSpec = swaggerJsdoc(options);