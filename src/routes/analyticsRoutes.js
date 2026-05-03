import express from 'express';
import { getSpeedingViolations, getActivitySummary, getHeatmapData, getVehicleTimeline } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ALL analytics are highly classified and require Admin privileges
router.use(protect);
router.use(authorize('admin'));

router.get('/speeding', getSpeedingViolations);
router.get('/activity', getActivitySummary);
router.get('/heatmap', getHeatmapData);
router.get('/vehicle/:id/timeline', getVehicleTimeline);

export default router;