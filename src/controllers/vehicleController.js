import Vehicle from '../models/Vehicle.js';
import PoliceStation from '../models/PoliceStation.js';
import District from '../models/District.js';
import LocationPing from '../models/LocationPing.js'; // NEW: Required for the current-location endpoint

// @desc    Register a new Tuk-Tuk
// @route   POST /api/vehicles
// @access  Private (Admin or Station Officer)
export const registerVehicle = async (req, res) => {
    try {
        const { registrationNumber, deviceId, driverName, ownerName, contactNumber, registeredStationId } = req.body;

        // 1. Check if vehicle or device already exists
        const existingVehicle = await Vehicle.findOne({
            $or: [{ registrationNumber }, { deviceId }]
        });
        if (existingVehicle) {
            return res.status(400).json({ message: 'Vehicle or Device ID already registered' });
        }

        // 2. Automatically find the District and Province based on the Station
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
        if (req.user.role === 'station') {
            filter.registeredStationId = req.user.stationId;
        }

        // ==========================================
        // 2. GEOGRAPHIC FILTERING (QUERY PARAMS)
        // ==========================================
        if (req.user.role === 'admin') {
            if (stationId) filter.registeredStationId = stationId;
            else if (districtId) filter.registeredDistrictId = districtId;
            else if (provinceId) filter.registeredProvinceId = provinceId;
        }

        // ==========================================
        // 3. SORTING & EXECUTION
        // ==========================================
        const sortOption = sortBy || '-createdAt';

        const vehicles = await Vehicle.find(filter)
            .populate('registeredStationId', 'name code')
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

// =====================================================================
// NEW ENDPOINTS ADDED BELOW TO MATCH SYSTEM ANALYSIS TABLE
// =====================================================================

// @desc    Get single vehicle details
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('registeredStationId', 'name code')
            .populate('registeredDistrictId', 'name')
            .populate('registeredProvinceId', 'name');

        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        // Security: Station Officers can only view vehicles registered to their station
        if (req.user.role === 'station' && vehicle.registeredStationId._id.toString() !== req.user.stationId.toString()) {
            return res.status(403).json({ message: 'Not authorized to view vehicles from other stations' });
        }
        res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update vehicle info
// @route   PUT /api/vehicles/:id
// @access  Private (Admin or Station Officer)
export const updateVehicle = async (req, res) => {
    try {
        let vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        // Security: Officers can only update their own station's vehicles
        if (req.user.role === 'station' && vehicle.registeredStationId.toString() !== req.user.stationId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this vehicle' });
        }

        vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
        res.status(500).json({ message: 'Error updating vehicle', error: error.message });
    }
};

// @desc    Delete/deactivate vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin ONLY)
export const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        await vehicle.deleteOne();
        res.status(200).json({ success: true, message: 'Vehicle removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
    }
};

// @desc    Get last known location
// @route   GET /api/vehicles/:id/current-location
// @access  Private
export const getCurrentLocation = async (req, res) => {
    try {
        // Find the single most recent ping for this vehicle
        const lastPing = await LocationPing.findOne({ vehicleId: req.params.id }).sort({ timestamp: -1 });
        if (!lastPing) return res.status(404).json({ message: 'No location data found for this vehicle' });

        res.status(200).json({ success: true, data: lastPing });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};