import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tuk-Tuk Tracking API',
            version: '1.0.0',
            description: [
                'Interactive API docs for the Sri Lanka Police Tuk-Tuk Tracking System.',
                '',
                'Try it out flow:',
                '1. Call POST /api/auth/login',
                '2. Copy the returned access token',
                '3. Click Authorize and paste only the JWT token',
                '4. Execute protected endpoints',
            ].join('\n'),
        },
        servers: [
            {
                url: '/',
                description: 'Same origin (default)',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication and session endpoints' },
            { name: 'Master Data', description: 'Provinces, districts, and stations' },
            { name: 'Vehicles', description: 'Vehicle registration and management' },
            { name: 'Location', description: 'Location ping, live map, and history' },
            { name: 'Analytics', description: 'Operational analytics and reports' },
            { name: 'Test', description: 'Connectivity and smoke-test endpoints' },
            { name: 'System', description: 'Service-level health checks' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'hq.admin@example.com' },
                        password: { type: 'string', example: 'Password123!' },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'role'],
                    properties: {
                        name: { type: 'string', example: 'Station Officer A' },
                        email: { type: 'string', format: 'email', example: 'station.officer@example.com' },
                        password: { type: 'string', example: 'Password123!' },
                        role: { type: 'string', example: 'station' },
                        provinceId: { type: 'string', example: '6640bba90f1f8b57ae649111' },
                        districtId: { type: 'string', example: '6640bba90f1f8b57ae649222' },
                        stationId: { type: 'string', example: '6640bba90f1f8b57ae649333' },
                    },
                },
                UserProfile: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '6640bba90f1f8b57ae649000' },
                        name: { type: 'string', example: 'HQ Admin' },
                        email: { type: 'string', format: 'email', example: 'hq.admin@example.com' },
                        role: { type: 'string', example: 'admin' },
                    },
                },
                ProvinceCreate: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Western Province' },
                    },
                },
                DistrictCreate: {
                    type: 'object',
                    required: ['name', 'provinceId'],
                    properties: {
                        name: { type: 'string', example: 'Colombo' },
                        provinceId: { type: 'string', example: '6640bba90f1f8b57ae649111' },
                    },
                },
                StationCreate: {
                    type: 'object',
                    required: ['name', 'districtId'],
                    properties: {
                        name: { type: 'string', example: 'Fort Police Station' },
                        districtId: { type: 'string', example: '6640bba90f1f8b57ae649222' },
                    },
                },
                VehicleCreate: {
                    type: 'object',
                    required: ['registrationNumber', 'ownerName'],
                    properties: {
                        registrationNumber: { type: 'string', example: 'WP-ABC-1234' },
                        ownerName: { type: 'string', example: 'Nimal Perera' },
                        ownerNic: { type: 'string', example: '901234567V' },
                        ownerPhone: { type: 'string', example: '+94771234567' },
                        stationId: { type: 'string', example: '6640bba90f1f8b57ae649333' },
                    },
                },
                VehicleUpdate: {
                    type: 'object',
                    properties: {
                        ownerName: { type: 'string', example: 'Kamal Silva' },
                        ownerPhone: { type: 'string', example: '+94770001122' },
                        status: { type: 'string', example: 'active' },
                    },
                },
                LocationPing: {
                    type: 'object',
                    required: ['vehicleId', 'latitude', 'longitude', 'speed', 'timestamp'],
                    properties: {
                        vehicleId: { type: 'string', example: '6640bba90f1f8b57ae649999' },
                        latitude: { type: 'number', format: 'float', example: 6.9271 },
                        longitude: { type: 'number', format: 'float', example: 79.8612 },
                        speed: { type: 'number', format: 'float', example: 43.5 },
                        timestamp: { type: 'string', format: 'date-time', example: '2026-05-18T08:30:00.000Z' },
                    },
                },
                BulkLocationPingRequest: {
                    type: 'object',
                    required: ['pings'],
                    properties: {
                        pings: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/LocationPing' },
                        },
                    },
                },
                SuccessMessage: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation completed successfully' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Validation failed' },
                    },
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

const jsonBody = (schemaRef) => ({
    required: true,
    content: {
        'application/json': {
            schema: { $ref: schemaRef },
        },
    },
});

const ok = (description = 'Success', schemaRef = '#/components/schemas/SuccessMessage') => ({
    description,
    content: {
        'application/json': {
            schema: { $ref: schemaRef },
        },
    },
});

const documentedPaths = {
    '/api/auth/login': {
        post: {
            tags: ['Auth'],
            summary: 'Login',
            description: 'Authenticate a user and return a JWT access token.',
            security: [],
            requestBody: jsonBody('#/components/schemas/LoginRequest'),
            responses: {
                200: ok('Login successful', '#/components/schemas/LoginResponse'),
                401: ok('Invalid credentials', '#/components/schemas/ErrorResponse'),
            },
        },
    },
    '/api/auth/register': {
        post: {
            tags: ['Auth'],
            summary: 'Register user',
            description: 'Create a new user account (admin only).',
            requestBody: jsonBody('#/components/schemas/RegisterRequest'),
            responses: {
                201: ok('User created', '#/components/schemas/SuccessMessage'),
                403: ok('Forbidden', '#/components/schemas/ErrorResponse'),
            },
        },
    },
    '/api/auth/me': {
        get: {
            tags: ['Auth'],
            summary: 'Get current user',
            responses: {
                200: ok('Current authenticated user', '#/components/schemas/UserProfile'),
            },
        },
    },
    '/api/auth/logout': {
        post: {
            tags: ['Auth'],
            summary: 'Logout',
            responses: {
                200: ok('Logout successful', '#/components/schemas/SuccessMessage'),
            },
        },
    },

    '/api/regions/provinces': {
        get: { tags: ['Master Data'], summary: 'List provinces', responses: { 200: ok('Province list') } },
        post: {
            tags: ['Master Data'],
            summary: 'Create province',
            description: 'Admin only',
            requestBody: jsonBody('#/components/schemas/ProvinceCreate'),
            responses: { 201: ok('Province created') },
        },
    },
    '/api/regions/districts': {
        get: { tags: ['Master Data'], summary: 'List districts', responses: { 200: ok('District list') } },
        post: {
            tags: ['Master Data'],
            summary: 'Create district',
            description: 'Admin only',
            requestBody: jsonBody('#/components/schemas/DistrictCreate'),
            responses: { 201: ok('District created') },
        },
    },
    '/api/regions/stations': {
        get: { tags: ['Master Data'], summary: 'List stations', responses: { 200: ok('Station list') } },
        post: {
            tags: ['Master Data'],
            summary: 'Create station',
            description: 'Admin only',
            requestBody: jsonBody('#/components/schemas/StationCreate'),
            responses: { 201: ok('Station created') },
        },
    },

    '/api/admin/provinces': {
        get: { tags: ['Master Data'], summary: 'List provinces (admin module)', responses: { 200: ok() } },
    },
    '/api/admin/provinces/{id}': {
        get: {
            tags: ['Master Data'],
            summary: 'Get province by id',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok() },
        },
    },
    '/api/admin/provinces/{id}/districts': {
        get: {
            tags: ['Master Data'],
            summary: 'Get districts by province id',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok() },
        },
    },
    '/api/admin/districts': {
        get: { tags: ['Master Data'], summary: 'List districts (admin module)', responses: { 200: ok() } },
    },
    '/api/admin/districts/{id}': {
        get: {
            tags: ['Master Data'],
            summary: 'Get district by id',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok() },
        },
    },
    '/api/admin/districts/{id}/stations': {
        get: {
            tags: ['Master Data'],
            summary: 'Get stations by district id',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok() },
        },
    },
    '/api/admin/stations': {
        get: { tags: ['Master Data'], summary: 'List stations (admin module)', responses: { 200: ok() } },
        post: {
            tags: ['Master Data'],
            summary: 'Create station (admin module)',
            requestBody: jsonBody('#/components/schemas/StationCreate'),
            responses: { 201: ok('Station created') },
        },
    },
    '/api/admin/stations/{id}': {
        get: {
            tags: ['Master Data'],
            summary: 'Get station by id',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok() },
        },
    },

    '/api/vehicles': {
        get: {
            tags: ['Vehicles'],
            summary: 'List vehicles',
            description: 'Optionally filtered by province, district, and station by query parameters.',
            responses: { 200: ok('Vehicle list') },
        },
        post: {
            tags: ['Vehicles'],
            summary: 'Register vehicle',
            requestBody: jsonBody('#/components/schemas/VehicleCreate'),
            responses: { 201: ok('Vehicle registered') },
        },
    },
    '/api/vehicles/{id}': {
        get: {
            tags: ['Vehicles'],
            summary: 'Get vehicle by id',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok() },
        },
        put: {
            tags: ['Vehicles'],
            summary: 'Update vehicle',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            requestBody: jsonBody('#/components/schemas/VehicleUpdate'),
            responses: { 200: ok('Vehicle updated') },
        },
        delete: {
            tags: ['Vehicles'],
            summary: 'Delete vehicle',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok('Vehicle deleted') },
        },
    },
    '/api/vehicles/{id}/current-location': {
        get: {
            tags: ['Vehicles'],
            summary: 'Get current vehicle location',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok('Current location') },
        },
    },
    '/api/vehicles/{id}/history': {
        get: {
            tags: ['Vehicles'],
            summary: 'Get vehicle history',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok('Location history') },
        },
    },

    '/api/locations/ping': {
        post: {
            tags: ['Location'],
            summary: 'Submit ping',
            description: 'Used by devices and authorized officers to send one location ping.',
            requestBody: jsonBody('#/components/schemas/LocationPing'),
            responses: { 201: ok('Ping accepted') },
        },
    },
    '/api/locations/live': {
        get: {
            tags: ['Location'],
            summary: 'Get live locations',
            responses: { 200: ok('Live location list') },
        },
    },
    '/api/locations/history/{vehicleId}': {
        get: {
            tags: ['Location'],
            summary: 'Get vehicle history by vehicle id',
            parameters: [{ name: 'vehicleId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok('Vehicle history') },
        },
    },
    '/api/locations/bulk': {
        post: {
            tags: ['Location'],
            summary: 'Submit bulk pings',
            requestBody: jsonBody('#/components/schemas/BulkLocationPingRequest'),
            responses: { 201: ok('Bulk pings accepted') },
        },
    },

    '/api/analytics/speeding': {
        get: { tags: ['Analytics'], summary: 'Get speeding violations', responses: { 200: ok() } },
    },
    '/api/analytics/activity': {
        get: { tags: ['Analytics'], summary: 'Get activity summary', responses: { 200: ok() } },
    },
    '/api/analytics/heatmap': {
        get: { tags: ['Analytics'], summary: 'Get heatmap data', responses: { 200: ok() } },
    },
    '/api/analytics/vehicle/{id}/timeline': {
        get: {
            tags: ['Analytics'],
            summary: 'Get vehicle timeline',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { 200: ok() },
        },
    },

    '/api/v1/test/ping': {
        get: {
            tags: ['Test'],
            summary: 'Ping',
            description: 'Simple endpoint to verify API reachability.',
            security: [],
            responses: { 200: ok('Pong response') },
        },
    },
    '/api/health': {
        get: {
            tags: ['System'],
            summary: 'Health check',
            security: [],
            responses: { 200: ok('API is healthy') },
        },
    },
};

export const createSwaggerSpec = (generatedPaths = {}) => ({
    ...staticSwaggerSpec,
    paths: mergePaths(mergePaths(generatedPaths, documentedPaths), staticSwaggerSpec.paths || {}),
});