import Vehicle from '../models/Vehicle.js';

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

// @desc    Get all registered Tuk-Tuks (with optional filtering)
// @route   GET /api/vehicles
export const getVehicles = async (req, res) => {
    try {
        // Allow filtering by stationId if provided in query params (e.g., ?stationId=123)
        const filter = req.query.stationId ? { registeredStationId: req.query.stationId } : {};

        // .populate() automatically fetches the linked Police Station data!
        const vehicles = await Vehicle.find(filter).populate('registeredStationId', 'name');

        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};