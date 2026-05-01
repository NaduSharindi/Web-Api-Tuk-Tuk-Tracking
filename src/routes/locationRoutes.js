import express from 'express';
import { addLocationPing, getLocationHistory, getLiveLocations, addBulkLocationPings } from '../controllers/locationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validatePing } from '../middleware/validationMiddleware.js'; // Keeping your awesome middleware!

const router = express.Router();

// 1. All location routes require a valid JWT token
router.use(protect);

// 2. Any authenticated device/user can send a ping (Simulating the Tuk-Tuk's tracker)
router.post('/ping', validatePing, addLocationPing);

// 3. Live Dashboard Map (Admin and Station Officers)
router.get('/live', authorize('admin', 'station'), getLiveLocations);

// 4. ONLY Admins and Station Officers are authorized to view the history
router.get('/history/:vehicleId', authorize('admin', 'station'), getLocationHistory);

router.post('/bulk', addBulkLocationPings); // (Add validatePing here if you upgrade it to handle arrays!)

export default router;