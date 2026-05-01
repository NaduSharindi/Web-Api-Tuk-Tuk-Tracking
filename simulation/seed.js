import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

import Province from '../src/models/Province.js';
import District from '../src/models/District.js';
import PoliceStation from '../src/models/PoliceStation.js';
import Vehicle from '../src/models/Vehicle.js';
import LocationPing from '../src/models/LocationPing.js';
import User from '../src/models/User.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for Full Simulation...');

        // Clear existing data to avoid duplicates
        await Promise.all([
            LocationPing.deleteMany(), Vehicle.deleteMany(),
            PoliceStation.deleteMany(), District.deleteMany(), Province.deleteMany(),
            User.deleteMany()
        ]);
        console.log('Cleared old database records...');

        // 1. Generate 9 Provinces
        const provinceNames = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];
        const provinces = await Province.insertMany(provinceNames.map(name => ({ name })));
        console.log(`Generated ${provinces.length} Provinces (Requirement Met)`);

        // 2. Generate 25 Districts mapped to Provinces
        const districtData = [
            { name: 'Colombo', prov: 'Western' }, { name: 'Gampaha', prov: 'Western' }, { name: 'Kalutara', prov: 'Western' },
            { name: 'Kandy', prov: 'Central' }, { name: 'Matale', prov: 'Central' }, { name: 'Nuwara Eliya', prov: 'Central' },
            { name: 'Galle', prov: 'Southern' }, { name: 'Matara', prov: 'Southern' }, { name: 'Hambantota', prov: 'Southern' },
            { name: 'Jaffna', prov: 'Northern' }, { name: 'Kilinochchi', prov: 'Northern' }, { name: 'Mannar', prov: 'Northern' }, { name: 'Vavuniya', prov: 'Northern' }, { name: 'Mullaitivu', prov: 'Northern' },
            { name: 'Batticaloa', prov: 'Eastern' }, { name: 'Ampara', prov: 'Eastern' }, { name: 'Trincomalee', prov: 'Eastern' },
            { name: 'Kurunegala', prov: 'North Western' }, { name: 'Puttalam', prov: 'North Western' },
            { name: 'Anuradhapura', prov: 'North Central' }, { name: 'Polonnaruwa', prov: 'North Central' },
            { name: 'Badulla', prov: 'Uva' }, { name: 'Moneragala', prov: 'Uva' },
            { name: 'Ratnapura', prov: 'Sabaragamuwa' }, { name: 'Kegalle', prov: 'Sabaragamuwa' }
        ];

        const districtsToInsert = districtData.map(d => ({
            name: d.name,
            provinceId: provinces.find(p => p.name === d.prov)._id
        }));
        const districts = await District.insertMany(districtsToInsert);
        console.log(`Generated ${districts.length} Districts (Requirement Met)`);

        // 3. Generate 20 Police Stations
        const stationsToInsert = [];
        for (let i = 0; i < 20; i++) {
            stationsToInsert.push({
                name: `${faker.location.city()} Police Station`,
                code: `PS-${faker.string.alphanumeric(4).toUpperCase()}-${i}`,
                districtId: districts[Math.floor(Math.random() * districts.length)]._id,
                location: {
                    type: 'Point',
                    coordinates: [
                        faker.location.longitude({ min: 79.84, max: 81.88 }),
                        faker.location.latitude({ min: 5.91, max: 9.85 })
                    ]
                },
                address: faker.location.streetAddress(),
                contactNumber: `011${faker.number.int({ min: 2000000, max: 2999999 })}`
            });
        }
        const stations = await PoliceStation.insertMany(stationsToInsert);
        console.log(`Generated ${stations.length} Police Stations (Requirement Met)`);

        // --- SIMULATE THE 3 USER TYPES ---

        // 1. Central Administrator (HQ Control)
        await User.create({
            username: "superadmin",
            password: "securepassword123",
            role: "admin"
        });
        console.log(`Generated 1 Central Administrator (Requirement Met)`);

        // 2. Police Stations & Authorized Users
        for (let i = 0; i < stations.length; i++) {
            await User.create({
                username: `officer_station_${i + 1}`,
                password: "password123",
                role: "station",
                stationId: stations[i]._id
            });
        }
        console.log(`Generated ${stations.length} Station Officers (Requirement Met)`);

        // 4. Generate 200 Tuk-Tuks
        const vehiclesToInsert = [];
        for (let i = 0; i < 200; i++) {
            const randomStation = stations[Math.floor(Math.random() * stations.length)];
            const parentDistrict = districts.find(d => d._id.toString() === randomStation.districtId.toString());

            vehiclesToInsert.push({
                registrationNumber: `WP-${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.number.int({ min: 1000, max: 9999 })}`,
                deviceId: `DEV-${faker.string.alphanumeric(6).toUpperCase()}-${i}`,
                ownerName: faker.person.fullName(),
                ownerPhone: `07${faker.number.int({ min: 10000000, max: 99999999 })}`,
                driverName: faker.person.fullName(),
                registeredStationId: randomStation._id,
                registeredDistrictId: parentDistrict._id,
                registeredProvinceId: parentDistrict.provinceId
            });
        }
        const vehicles = await Vehicle.insertMany(vehiclesToInsert);
        console.log(`Generated ${vehicles.length} Registered Tuk-Tuks (Requirement Met)`);

        // 5. Generate 1 Week of Location History (FULLY POPULATED!)
        const pingsToInsert = [];
        for (const vehicle of vehicles) {
            for (let j = 0; j < 5; j++) {
                pingsToInsert.push({
                    vehicleId: vehicle._id,
                    deviceId: vehicle.deviceId, // NEW: Required Device ID
                    location: {
                        type: 'Point',
                        coordinates: [
                            faker.location.longitude({ min: 79.84, max: 81.88 }),
                            faker.location.latitude({ min: 5.91, max: 9.85 })
                        ]
                    },
                    speed: faker.number.int({ min: 10, max: 60 }),
                    heading: faker.number.int({ min: 0, max: 360 }), // NEW: Required heading
                    accuracy: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }), // NEW: Required accuracy
                    provinceId: vehicle.registeredProvinceId, // NEW: Geographic link
                    districtId: vehicle.registeredDistrictId, // NEW: Geographic link
                    // Ensures the first ping is exactly "now" so the Live Map has active data
                    timestamp: j === 0 ? new Date() : faker.date.recent({ days: 7 })
                });
            }
        }
        await LocationPing.insertMany(pingsToInsert);
        console.log(`Generated ${pingsToInsert.length} historical location pings! (Requirement Met)`);

        console.log('ALL COURSEWORK SIMULATION REQUIREMENTS FULFILLED!');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedDatabase();