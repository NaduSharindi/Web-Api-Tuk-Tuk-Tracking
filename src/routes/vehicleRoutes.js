import express from 'express';
import { registerVehicle, getVehicles } from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All vehicle routes are protected
router.use(protect);

// Only ADMIN and STATION_OFFICER can manage vehicles
router.use(authorize('ADMIN', 'STATION_OFFICER'));

router.post('/', registerVehicle);
/**
 * @swagger
 * /api/vehicles:
 * get:
 * summary: Retrieve a list of vehicles
 * description: Retrieve all Tuk-Tuks. Can be filtered by provinceId, districtId, or stationId.
 * tags: [Vehicles]
 * responses:
 * 200:
 * description: A list of vehicles.
 * 401:
 * description: Unauthorized. Missing or invalid token.
 */
router.get('/', getVehicles);

export default router;