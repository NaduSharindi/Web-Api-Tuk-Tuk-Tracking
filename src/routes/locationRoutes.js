import express from 'express';
import { addLocationPing, getLocationHistory, getLiveLocations, addBulkLocationPings } from '../controllers/locationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validatePing, validateBulkPings } from '../middleware/validationMiddleware.js';

const router = express.Router();

// 1. All location routes require a valid JWT token
router.use(protect);

// 2. Any authenticated device/user can send a ping (Device role added!)
router.post('/ping', authorize('device', 'admin', 'station'), validatePing, addLocationPing);

// 3. Live Dashboard Map (Admin, Provincial, and Station Officers)
router.get('/live', authorize('admin', 'provincial', 'station'), getLiveLocations);

// 4. History viewing (Admin, Provincial, and Station Officers)
router.get('/history/:vehicleId', authorize('admin', 'provincial', 'station'), getLocationHistory);

// 5. Batch updates for offline devices (Device role added!)
router.post('/bulk', authorize('device', 'admin', 'station'), validateBulkPings, addBulkLocationPings);

export default router;