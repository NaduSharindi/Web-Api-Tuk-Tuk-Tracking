import express from 'express';
import {
    addProvince,
    getProvinces,
    addDistrict,
    getDistricts,
    addPoliceStation,
    getStations
} from '../controllers/regionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Protect all routes below this line (User must have a valid JWT)
router.use(protect);

// 2. We allow anyone logged in (Admins and Officers) to GET the region lists
router.get('/provinces', getProvinces);
router.get('/districts', getDistricts); // <-- NEW: Fixes the 404 error
router.get('/stations', getStations);   // <-- NEW: Fixes the 404 error

// 3. Restrict all routes below this line to ADMIN only
router.use(authorize('ADMIN'));

router.post('/provinces', addProvince);
router.post('/districts', addDistrict);
router.post('/stations', addPoliceStation);

export default router;