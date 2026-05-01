import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    getProvinces, getProvinceById, getDistrictsByProvince,
    getDistricts, getDistrictById, getStationsByDistrict,
    getStations, getStationById, createStation
} from '../controllers/administrativeController.js';

const router = express.Router();

// ALL routes require authentication
router.use(protect);

// Province Routes
router.get('/provinces', getProvinces);
router.get('/provinces/:id', getProvinceById);
router.get('/provinces/:id/districts', getDistrictsByProvince);

// District Routes
router.get('/districts', getDistricts);
router.get('/districts/:id', getDistrictById);
router.get('/districts/:id/stations', getStationsByDistrict);

// Station Routes
router.get('/stations', getStations);
router.get('/stations/:id', getStationById);

// ONLY Admins can create new stations
router.post('/stations', authorize('admin'), createStation);

export default router;