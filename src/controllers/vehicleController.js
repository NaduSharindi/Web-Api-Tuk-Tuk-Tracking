import Vehicle from '../models/Vehicle.js';
import PoliceStation from '../models/PoliceStation.js';
import District from '../models/District.js';

// @desc    Register a new Tuk-Tuk
// @route   POST /api/vehicles
export const registerVehicle = async (req, res) => {
    try {
        const { registrationNumber, ownerName, contactNumber, registeredStationId } = req.body;

        // Check if vehicle already exists
        const existingVehicle = await Vehicle.findOne({ registrationNumber });
        if (existingVehicle) {
            return res.status(400).json({ message: 'Vehicle with this registration number already exists' });
        }

        const vehicle = await Vehicle.create({
            registrationNumber,
            ownerName,
            contactNumber,
            registeredStationId
        });

        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error registering vehicle', error: error.message });
    }
};

// @desc    Get all registered Tuk-Tuks (with advanced filtering and sorting)
// @route   GET /api/vehicles
export const getVehicles = async (req, res) => {
    try {
        const { provinceId, districtId, stationId, sortBy } = req.query;
        let stationIdsToSearch = [];

        // Logic to find applicable stations based on Province or District
        if (provinceId) {
            const districts = await District.find({ provinceId });
            const districtIds = districts.map(d => d._id);
            const stations = await PoliceStation.find({ districtId: { $in: districtIds } });
            stationIdsToSearch = stations.map(s => s._id);
        } else if (districtId) {
            const stations = await PoliceStation.find({ districtId });
            stationIdsToSearch = stations.map(s => s._id);
        }

        // Build the final filter object
        let filter = {};
        if (stationId) {
            filter.registeredStationId = stationId; // Exact match
        } else if (provinceId || districtId) {
            filter.registeredStationId = { $in: stationIdsToSearch }; // Filter by region
        }

        // Level 5 Requirement: Sorting (Defaults to newest first if not provided)
        const sortOption = sortBy || '-createdAt';

        // Execute the query
        const vehicles = await Vehicle.find(filter)
            .populate('registeredStationId', 'name')
            .sort(sortOption);

        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};