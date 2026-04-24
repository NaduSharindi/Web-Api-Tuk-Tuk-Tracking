import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import regionRoutes from './routes/regionRoutes.js';

const app = express();

// Middleware
app.use(cors()); // Allows cross-origin requests
app.use(express.json()); // Parses incoming JSON payloads
// Mount the routes
app.use('/api/auth', authRoutes);
app.use('/api/regions', regionRoutes);

// A simple health-check route to verify the API is running
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Tuk-Tuk Tracking API is running' });
});

export default app;