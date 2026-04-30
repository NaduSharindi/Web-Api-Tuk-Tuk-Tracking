import LocationPing from '../models/LocationPing.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Submit a location update (From Tuk-Tuk Device)
// @route   POST /api/locations/ping
// @access  Private (Device or Admin)
export const addLocationPing = async (req, res) => {
    try {
        const { vehicleId, deviceId, latitude, longitude, speed, heading, timestamp } = req.body;

        const ping = await LocationPing.create({
            vehicleId,
            deviceId,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude] // GeoJSON strictly requires Longitude first!
            },
            speed,
            heading,
            timestamp: timestamp || Date.now()
        });

        res.status(201).json({ success: true, data: ping });
    } catch (error) {
        res.status(500).json({ message: 'Error saving location', error: error.message });
    }
};

// @desc    Get historical movement logs for a vehicle
// @route   GET /api/locations/history/:vehicleId
// @access  Private
export const getLocationHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const { vehicleId } = req.params;

        // Build the time-window query
        let query = { vehicleId: vehicleId };

        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const history = await LocationPing.find(query).sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};