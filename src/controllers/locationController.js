import mongoose from 'mongoose';
import LocationPing from '../models/LocationPing.js';
import Vehicle from '../models/Vehicle.js';
import PoliceStation from '../models/PoliceStation.js'; // Needed to look up the Station Officer's district

// @desc    Submit a location update (From Tuk-Tuk Device)
// @route   POST /api/locations/ping
// @access  Private (Device or Admin)
export const addLocationPing = async (req, res) => {
    try {
        const { vehicleId, deviceId, latitude, longitude, speed, heading, accuracy, timestamp } = req.body;

        const vehicle = await Vehicle.findOne({ deviceId: deviceId });
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found for this device' });
        }

        const ping = await LocationPing.create({
            vehicleId: vehicle._id,
            deviceId,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            speed,
            heading,
            accuracy,
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
        const { startDate, endDate, province, district } = req.query;
        const { vehicleId } = req.params;

        let query = { vehicleId: vehicleId };

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        if (province) query.provinceId = province;
        if (district) query.districtId = district;

        // --- 🔒 ROLE-BASED SECURITY OVERRIDES ---
        if (req.user.role === 'station') {
            const userStation = await PoliceStation.findById(req.user.stationId);
            query.districtId = userStation.districtId; // Lock to their district
        } else if (req.user.role === 'provincial') {
            query.provinceId = req.user.provinceId; // Lock to their province
        }
        // ----------------------------------------

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
        const { province, district, vehicleIds, since } = req.query;
        let matchStage = {};

        const timeLimit = since ? new Date(since) : new Date(Date.now() - 15 * 60 * 1000);
        matchStage.timestamp = { $gte: timeLimit };

        if (province) matchStage.provinceId = new mongoose.Types.ObjectId(province);
        if (district) matchStage.districtId = new mongoose.Types.ObjectId(district);

        if (vehicleIds) {
            const idsArray = vehicleIds.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
            matchStage.vehicleId = { $in: idsArray };
        }

        // --- 🔒 ROLE-BASED SECURITY OVERRIDES ---
        if (req.user.role === 'station') {
            const userStation = await PoliceStation.findById(req.user.stationId);
            matchStage.districtId = userStation.districtId; // Force district filter
        } else if (req.user.role === 'provincial') {
            matchStage.provinceId = new mongoose.Types.ObjectId(req.user.provinceId); // Force province filter
        }
        // ----------------------------------------

        const liveLocations = await LocationPing.aggregate([
            { $match: matchStage },
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
        const { pings } = req.body;

        if (!pings || !Array.isArray(pings) || pings.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of location pings' });
        }

        const deviceId = pings[0].deviceId;
        const vehicle = await Vehicle.findOne({ deviceId: deviceId });

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found for this device' });
        }

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

        const insertedPings = await LocationPing.insertMany(formattedPings);

        res.status(201).json({ success: true, count: insertedPings.length, message: 'Bulk insert successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving bulk locations', error: error.message });
    }
};