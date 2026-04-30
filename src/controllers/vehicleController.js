import Vehicle from '../models/Vehicle.js';
import PoliceStation from '../models/PoliceStation.js';
import District from '../models/District.js';

// @desc    Register a new Tuk-Tuk
// @route   POST /api/vehicles
// @access  Private (Admin or Station Officer)
export const registerVehicle = async (req, res) => {
    try {
        // Added deviceId and driverName based on the System Analysis requirement
        const { registrationNumber, deviceId, driverName, ownerName, contactNumber, registeredStationId } = req.body;

        // 1. Check if vehicle or device already exists
        const existingVehicle = await Vehicle.findOne({
            $or: [{ registrationNumber }, { deviceId }]
        });
        if (existingVehicle) {
            return res.status(400).json({ message: 'Vehicle or Device ID already registered' });
        }

        // 2. Automatically find the District and Province based on the Station
        // This makes filtering much faster later!
        const station = await PoliceStation.findById(registeredStationId).populate('districtId');
        if (!station) {
            return res.status(404).json({ message: 'Police Station not found' });
        }

        // 3. Create the vehicle with the full geographic hierarchy
        const vehicle = await Vehicle.create({
            registrationNumber,
            deviceId,
            driverName,
            ownerName,
            contactNumber,
            registeredStationId: station._id,
            registeredDistrictId: station.districtId._id,
            registeredProvinceId: station.districtId.provinceId
        });

        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error registering vehicle', error: error.message });
    }
};

// @desc    Get all registered Tuk-Tuks (with Role-Based Access and Geographic Filtering)
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
    try {
        const { provinceId, districtId, stationId, sortBy } = req.query;

        // Initialize an empty filter
        let filter = {};

        // ==========================================
        // 1. ROLE-BASED ACCESS CONTROL (SECURITY)
        // ==========================================
        if (req.user.role === 'STATION_OFFICER') {
            // FORCE the filter to only allow this user's specific station
            // They cannot override this, even if they put a different stationId in the URL!
            filter.registeredStationId = req.user.stationId;
        }
        // If they are an ADMIN, we do not restrict the base filter.

        // ==========================================
        // 2. GEOGRAPHIC FILTERING (QUERY PARAMS)
        // ==========================================
        // Only apply these if the user is an Admin (or if we expand to Provincial Officers later)
        if (req.user.role === 'ADMIN') {
            if (stationId) filter.registeredStationId = stationId;
            else if (districtId) filter.registeredDistrictId = districtId;
            else if (provinceId) filter.registeredProvinceId = provinceId;
        }

        // ==========================================
        // 3. SORTING & EXECUTION
        // ==========================================
        const sortOption = sortBy || '-createdAt';

        const vehicles = await Vehicle.find(filter)
            .populate('registeredStationId', 'name code') // Bring in the station details
            .sort(sortOption);

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};