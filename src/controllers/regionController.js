import Province from '../models/Province.js';
import District from '../models/District.js';
import PoliceStation from '../models/PoliceStation.js';

// --- PROVINCES ---
export const addProvince = async (req, res) => {
    try {
        const province = await Province.create({ name: req.body.name });
        res.status(201).json(province);
    } catch (error) {
        res.status(400).json({ message: 'Error adding province', error: error.message });
    }
};

export const getProvinces = async (req, res) => {
    try {
        const provinces = await Province.find();
        res.status(200).json(provinces);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// --- DISTRICTS ---
export const addDistrict = async (req, res) => {
    try {
        const { name, provinceId } = req.body;
        const district = await District.create({ name, provinceId });
        res.status(201).json(district);
    } catch (error) {
        res.status(400).json({ message: 'Error adding district', error: error.message });
    }
};

// --- POLICE STATIONS ---
export const addPoliceStation = async (req, res) => {
    try {
        const { name, districtId } = req.body;
        const station = await PoliceStation.create({ name, districtId });
        res.status(201).json(station);
    } catch (error) {
        res.status(400).json({ message: 'Error adding police station', error: error.message });
    }
};