import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { collectRouterPaths, createSwaggerSpec } from './config/swagger.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import regionRoutes from './routes/regionRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import administrativeRoutes from './routes/administrativeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import testRoutes from './routes/testRoutes.js';

const app = express();

const generatedPaths = {
    ...collectRouterPaths({
        basePath: '/api/auth',
        router: authRoutes,
        tag: 'Auth',
        publicRoutes: [{ method: 'post', path: '/login' }],
    }),
    ...collectRouterPaths({
        basePath: '/api/regions',
        router: regionRoutes,
        tag: 'Regions',
    }),
    ...collectRouterPaths({
        basePath: '/api/vehicles',
        router: vehicleRoutes,
        tag: 'Vehicles',
    }),
    ...collectRouterPaths({
        basePath: '/api/locations',
        router: locationRoutes,
        tag: 'Locations',
    }),
    ...collectRouterPaths({
        basePath: '/api/admin',
        router: administrativeRoutes,
        tag: 'Administrative',
    }),
    ...collectRouterPaths({
        basePath: '/api/analytics',
        router: analyticsRoutes,
        tag: 'Analytics',
    }),
    ...collectRouterPaths({
        basePath: '/api/v1/test',
        router: testRoutes,
        tag: 'Test',
        secure: false,
    }),
    '/api/health': {
        get: {
            tags: ['System'],
            summary: 'Health check',
            security: [],
            responses: {
                200: {
                    description: 'API is healthy',
                },
            },
        },
    },
};

const swaggerUiOptions = {
  customSiteTitle: "Tuk-Tuk API Documentation" // <--- This changes the browser tab name
};

// 2. Pass the options as the second argument to swaggerUi.setup()
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

const swaggerSpec = createSwaggerSpec(generatedPaths);

// 1. DATA PROTECTION: Strict CORS Configuration
app.use(cors({
    origin: '*', // For production, change this to your actual frontend domain!
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parses incoming JSON payloads
app.use(express.json());

// 2. RATE LIMITING: Global API Queries (1000 per hour per IP)
const globalLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
    message: { message: 'Too many requests from this IP, please try again in an hour.' }
});
app.use('/api', globalLimiter);

// 3. RATE LIMITING: Auth Attempts (5 per 15 minutes)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Too many login attempts, please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);

// 4. RATE LIMITING: Device Pings (100 per hour)
const pingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    message: { message: 'Device ping limit exceeded.' }
});
app.use('/api/locations/ping', pingLimiter);
app.use('/api/locations/bulk', pingLimiter);

// <-- SWAGGER ROUTE -->
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/test', testRoutes);

// <-- MOUNT ALL APP ROUTES -->
app.use('/api/auth', authRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/admin', administrativeRoutes); // Note: Make sure this path matches what you want!
app.use('/api/analytics', analyticsRoutes);

// A simple health-check route to verify the API is running
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Tuk-Tuk Tracking API is running securely' });
});

export default app;