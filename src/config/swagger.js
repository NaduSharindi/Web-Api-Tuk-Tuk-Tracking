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

const staticSwaggerSpec = swaggerJsdoc(options);

const normalizePath = (path) => {
    if (!path) return '/';
    const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
    return withLeadingSlash.replace(/\/{2,}/g, '/');
};

const toOpenApiPath = (path) => normalizePath(path).replace(/:([A-Za-z0-9_]+)/g, '{$1}');

const methodSummary = (method, path) => `${method.toUpperCase()} ${path}`;

const buildOperation = ({ method, openApiPath, tag, secure = true }) => {
    const operation = {
        tags: [tag],
        summary: methodSummary(method, openApiPath),
        responses: {
            200: {
                description: 'Success',
            },
            401: {
                description: 'Unauthorized',
            },
        },
    };

    if (!secure) {
        operation.security = [];
    }

    return operation;
};

export const collectRouterPaths = ({
    basePath,
    router,
    tag,
    secure = true,
    publicRoutes = [],
}) => {
    const paths = {};
    if (!router?.stack) return paths;

    const publicRouteSet = new Set(
        publicRoutes.map((route) => `${route.method.toLowerCase()} ${normalizePath(route.path)}`)
    );

    router.stack
        .filter((layer) => layer.route)
        .forEach((layer) => {
            const routePath = normalizePath(layer.route.path);
            const mergedPath = normalizePath(`${normalizePath(basePath)}${routePath}`);
            const openApiPath = toOpenApiPath(mergedPath);

            paths[openApiPath] = paths[openApiPath] || {};

            Object.entries(layer.route.methods).forEach(([method, enabled]) => {
                if (!enabled) return;
                const publicKey = `${method.toLowerCase()} ${routePath}`;
                const isSecure = secure && !publicRouteSet.has(publicKey);

                paths[openApiPath][method] = buildOperation({
                    method,
                    openApiPath,
                    tag,
                    secure: isSecure,
                });
            });
        });

    return paths;
};

const mergePaths = (generatedPaths = {}, documentedPaths = {}) => {
    const merged = { ...generatedPaths };

    Object.entries(documentedPaths).forEach(([path, methods]) => {
        merged[path] = {
            ...(merged[path] || {}),
            ...methods,
        };
    });

    return merged;
};

export const createSwaggerSpec = (generatedPaths = {}) => ({
    ...staticSwaggerSpec,
    paths: mergePaths(generatedPaths, staticSwaggerSpec.paths || {}),
});