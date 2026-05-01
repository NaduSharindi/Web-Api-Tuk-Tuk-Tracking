import LocationPing from '../models/LocationPing.js';
import Vehicle from '../models/Vehicle.js';

// @desc    Submit a location update (From Tuk-Tuk Device)
// @route   POST /api/locations/ping
// @access  Private (Device or Admin)
export const addLocationPing = async (req, res) => {
    try {
        const { vehicleId, deviceId, latitude, longitude, speed, heading, accuracy, timestamp } = req.body;

        // 1. Find the vehicle to get its registered province and district for fast map filtering
        const vehicle = await Vehicle.findOne({ deviceId: deviceId });
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found for this device' });
        }

        // 2. Create the ping with the full GeoJSON format and geographic links
        const ping = await LocationPing.create({
            vehicleId: vehicle._id,
            deviceId,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude] // GeoJSON strictly requires Longitude first!
            },
            speed,
            heading,
            accuracy, // Required by spec
            provinceId: vehicle.registeredProvinceId,
            districtId: vehicle.registeredDistrictId,
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

        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get latest locations of all vehicles (For the Live Dashboard Map)
// @route   GET /api/locations/live
// @access  Private
export const getLiveLocations = async (req, res) => {
    try {
        // To prevent massive data loads, we only fetch pings from the last 15 minutes
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

        // MongoDB Aggregation: Group by vehicle ID and get the most recent ping for each
        const liveLocations = await LocationPing.aggregate([
            { $match: { timestamp: { $gte: fifteenMinsAgo } } },
            { $sort: { timestamp: -1 } },
            { $group: {
                    _id: "$vehicleId",
                    deviceId: { $first: "$deviceId" },
                    location: { $first: "$location" },
                    speed: { $first: "$speed" },
                    heading: { $first: "$heading" },
                    timestamp: { $first: "$timestamp" }
                }}
        ]);

        res.status(200).json({ success: true, count: liveLocations.length, data: liveLocations });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Submit multiple location updates at once (Batch/Offline syncing)
// @route   POST /api/locations/bulk
// @access  Private (Device or Admin)
export const addBulkLocationPings = async (req, res) => {
    try {
        const { pings } = req.body; // Expecting an array of ping objects

        if (!pings || !Array.isArray(pings) || pings.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of location pings' });
        }

        // 1. Get the device ID from the first ping to find the vehicle
        const deviceId = pings[0].deviceId;
        const vehicle = await Vehicle.findOne({ deviceId: deviceId });

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found for this device' });
        }

        // 2. Format all pings for insertion
        const formattedPings = pings.map(ping => ({
            vehicleId: vehicle._id,
            deviceId: ping.deviceId,
            location: {
                type: 'Point',
                coordinates: [ping.longitude, ping.latitude]
            },
            speed: ping.speed,
            heading: ping.heading,
            accuracy: ping.accuracy,
            provinceId: vehicle.registeredProvinceId,
            districtId: vehicle.registeredDistrictId,
            timestamp: ping.timestamp || Date.now()
        }));

        // 3. Perform a massive bulk insert (Super fast!)
        const insertedPings = await LocationPing.insertMany(formattedPings);

        res.status(201).json({ success: true, count: insertedPings.length, message: 'Bulk insert successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving bulk locations', error: error.message });
    }
};