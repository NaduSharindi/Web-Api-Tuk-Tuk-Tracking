import express from 'express';
import { addProvince, getProvinces, addDistrict, addPoliceStation } from '../controllers/regionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Protect all routes below this line (User must have a valid JWT)
router.use(protect);

// 2. We can allow anyone logged in to GET the provinces
router.get('/provinces', getProvinces);

// 3. Restrict all routes below this line to ADMIN only
router.use(authorize('ADMIN'));

router.post('/provinces', addProvince);
router.post('/districts', addDistrict);
router.post('/stations', addPoliceStation);

export default router;