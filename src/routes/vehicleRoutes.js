import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    registerVehicle, getVehicles, getVehicleById,
    updateVehicle, deleteVehicle, getCurrentLocation
} from '../controllers/vehicleController.js';
import { getLocationHistory } from '../controllers/locationController.js';

const router = express.Router();

// ALL vehicle routes require a valid JWT token
router.use(protect);

// Registration is Admin and Station Officer only
router.post('/', authorize('admin', 'station'), registerVehicle);
router.get('/', getVehicles);

// --- NEW CRUD & MANAGEMENT ROUTES ---

// View a single vehicle
router.get('/:id', getVehicleById);

// Update a vehicle (Admin or Station Officer)
router.put('/:id', authorize('admin', 'station'), updateVehicle);

// Delete a vehicle (STRICTLY Admin ONLY)
router.delete('/:id', authorize('admin'), deleteVehicle);

// Location shortcuts on the Vehicle endpoint
router.get('/:id/current-location', getCurrentLocation);
router.get('/:id/history', authorize('admin', 'station'), getLocationHistory);

export default router;