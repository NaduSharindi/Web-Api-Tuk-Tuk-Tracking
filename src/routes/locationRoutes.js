import express from 'express';
import { addLocationPing, getLocationHistory } from '../controllers/locationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validatePing } from '../middleware/validationMiddleware.js';

const router = express.Router();

// 1. All location routes require a valid JWT token
router.use(protect);

// 2. Any authenticated device/user can send a ping (Simulating the Tuk-Tuk's tracker)
router.post('/ping', addLocationPing);

// 3. ONLY Admins and Station Officers are authorized to view the history
router.get('/history/:vehicleId', authorize('admin', 'station'), getLocationHistory);

router.post('/ping', validatePing, addLocationPing);

export default router;