import LocationPing from '../models/LocationPing.js';

// @desc    Record a new GPS ping from a Tuk-Tuk
// @route   POST /api/locations/ping
export const addLocationPing = async (req, res) => {
    try {
        const { vehicleId, longitude, latitude, speed } = req.body;

        const ping = await LocationPing.create({
            vehicleId,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude] // Note: GeoJSON requires Longitude first, then Latitude!
            },
            speed
        });

        res.status(201).json(ping);
    } catch (error) {
        res.status(500).json({ message: 'Error saving location ping', error: error.message });
    }
};

// @desc    Get location history for a specific vehicle
// @route   GET /api/locations/history/:vehicleId
export const getLocationHistory = async (req, res) => {
    try {
        // Find all pings for the given vehicle, sorted by newest first (-1)
        const history = await LocationPing.find({ vehicleId: req.params.vehicleId })
            .sort({ createdAt: -1 });

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server Error retrieving history', error: error.message });
    }
};