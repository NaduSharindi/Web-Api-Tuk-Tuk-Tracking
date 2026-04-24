import express from 'express';
import { registerVehicle, getVehicles } from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All vehicle routes are protected
router.use(protect);

// Only ADMIN and STATION_OFFICER can manage vehicles
router.use(authorize('ADMIN', 'STATION_OFFICER'));

router.post('/', registerVehicle);
router.get('/', getVehicles);

export default router;