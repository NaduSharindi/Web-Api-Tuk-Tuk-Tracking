import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import regionRoutes from './routes/regionRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();

// Middleware
app.use(cors()); // Allows cross-origin requests
app.use(express.json()); // Parses incoming JSON payloads
// Mount the routes
app.use('/api/auth', authRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/locations', locationRoutes);

// <-- NEW SWAGGER ROUTE -->
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// A simple health-check route to verify the API is running
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Tuk-Tuk Tracking API is running' });
});

export default app;