import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import regionRoutes from './routes/regionRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import rateLimit from 'express-rate-limit';
import administrativeRoutes from './routes/administrativeRoutes.js';

const app = express();

// 1. General API Rate Limiter (Max 1000 requests per hour)
const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
    message: 'Too many requests from this IP, please try again after an hour'
});

// 2. Strict Auth Limiter (Protects against hackers guessing passwords)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per window
    message: 'Too many login attempts, please try again after 15 minutes'
});

// Middleware
app.use(cors()); // Allows cross-origin requests
app.use(express.json()); // Parses incoming JSON payloads
// Mount the routes
app.use('/api/auth', authRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api', administrativeRoutes);

// <-- NEW SWAGGER ROUTE -->
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// A simple health-check route to verify the API is running
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Tuk-Tuk Tracking API is running' });
});

export default app;