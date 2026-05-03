import LocationPing from '../models/LocationPing.js';

// @desc    Identify speeding violations
// @route   GET /api/analytics/speeding
// @access  Private (Admin)
export const getSpeedingViolations = async (req, res) => {
    try {
        // Default speed limit is 50 km/h, but can be customized via query params
        const speedLimit = req.query.limit ? parseInt(req.query.limit) : 50;

        const violations = await LocationPing.find({ speed: { $gt: speedLimit } })
            .populate('vehicleId', 'registrationNumber driverName ownerPhone')
            .sort({ timestamp: -1 }) // Newest first
            .limit(100); // Limit to top 100 recent violations

        res.status(200).json({ success: true, count: violations.length, data: violations });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Calculate active hours/summary per vehicle
// @route   GET /api/analytics/activity
// @access  Private (Admin)
export const getActivitySummary = async (req, res) => {
    try {
        // MongoDB Aggregation to calculate statistics for EVERY vehicle in one database query!
        const activity = await LocationPing.aggregate([
            {
                $group: {
                    _id: "$vehicleId",
                    totalDataPoints: { $sum: 1 },
                    averageSpeed: { $avg: "$speed" },
                    maxSpeed: { $max: "$speed" },
                    firstSeen: { $min: "$timestamp" },
                    lastSeen: { $max: "$timestamp" }
                }
            },
            { $sort: { totalDataPoints: -1 } } // Sort by most active vehicles
        ]);

        // Note: For a real enterprise app, you'd calculate exact hours based on firstSeen/lastSeen.
        // Here we summarize their activity profile.
        res.status(200).json({ success: true, count: activity.length, data: activity });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Generate density heatmap data (Returns raw coordinates for frontend map plugins)
// @route   GET /api/analytics/heatmap
// @access  Private (Admin)
export const getHeatmapData = async (req, res) => {
    try {
        // We only need the coordinates to draw a heatmap, so we use select() to make the payload tiny and fast
        const pings = await LocationPing.find()
            .select('location.coordinates speed -_id')
            .limit(5000); // Cap it so we don't crash the frontend browser

        res.status(200).json({ success: true, count: pings.length, data: pings });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get vehicle movement timeline and speeding analytics
// @route   GET /api/analytics/vehicle/:id/timeline
// @access  Private
export const getVehicleTimeline = async (req, res) => {
    try {
        const vehicleId = req.params.id;

        // 1. Fetch all historical pings for this specific vehicle, newest first
        const history = await LocationPing.find({ vehicleId: vehicleId })
            .sort({ timestamp: -1 });

        if (!history || history.length === 0) {
            return res.status(404).json({ message: 'No telemetry data found for this vehicle' });
        }

        // 2. Algorithmically calculate business intelligence (Speeding Violations)
        const SPEED_LIMIT = 50.0; // 50 km/h municipal limit
        const speedingViolations = history.filter(ping => ping.speed > SPEED_LIMIT);

        // 3. Format the Analytics Response
        res.status(200).json({
            success: true,
            analytics: {
                vehicleId: vehicleId,
                totalDataPoints: history.length,
                speedingViolationsCount: speedingViolations.length,
                status: speedingViolations.length > 0 ? "FLAGGED - SPEEDING" : "COMPLIANT",
            },
            violations: speedingViolations, // Shows only the pings where they broke the law
            timeline: history // Shows all pings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error generating analytics', error: error.message });
    }
};