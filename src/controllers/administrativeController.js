import Province from '../models/Province.js';
import District from '../models/District.js';
import PoliceStation from '../models/PoliceStation.js';

// --- PROVINCE ENDPOINTS ---
export const getProvinces = async (req, res) => {
    const provinces = await Province.find();
    res.status(200).json({ success: true, count: provinces.length, data: provinces });
};

export const getProvinceById = async (req, res) => {
    const province = await Province.findById(req.params.id);
    res.status(200).json({ success: true, data: province });
};

export const getDistrictsByProvince = async (req, res) => {
    const districts = await District.find({ provinceId: req.params.id });
    res.status(200).json({ success: true, count: districts.length, data: districts });
};

// --- DISTRICT ENDPOINTS ---
export const getDistricts = async (req, res) => {
    const districts = await District.find().populate('provinceId', 'name code');
    res.status(200).json({ success: true, count: districts.length, data: districts });
};

export const getDistrictById = async (req, res) => {
    const district = await District.findById(req.params.id).populate('provinceId', 'name code');
    res.status(200).json({ success: true, data: district });
};

export const getStationsByDistrict = async (req, res) => {
    const stations = await PoliceStation.find({ districtId: req.params.id });
    res.status(200).json({ success: true, count: stations.length, data: stations });
};

// --- STATION ENDPOINTS ---
export const getStations = async (req, res) => {
    const stations = await PoliceStation.find().populate('districtId', 'name');
    res.status(200).json({ success: true, count: stations.length, data: stations });
};

export const getStationById = async (req, res) => {
    const station = await PoliceStation.findById(req.params.id).populate('districtId', 'name');
    res.status(200).json({ success: true, data: station });
};

export const createStation = async (req, res) => {
    try {
        const station = await PoliceStation.create(req.body);
        res.status(201).json({ success: true, data: station });
    } catch (error) {
        res.status(400).json({ message: 'Error creating station', error: error.message });
    }
};