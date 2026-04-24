import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

// Import your models
import Vehicle from '../src/models/Vehicle.js';
import LocationPing from '../src/models/LocationPing.js';
import PoliceStation from '../src/models/PoliceStation.js';

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' });

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for Simulation...');

        // 1. Get an existing Police Station to register the Tuk-Tuks to
        const stations = await PoliceStation.find();
        if (stations.length === 0) {
            console.error('❌ No Police Stations found. Please create one in Postman first.');
            process.exit(1);
        }
        const stationId = stations[0]._id;

        console.log('⏳ Generating 200 Tuk-Tuks...');
        const vehiclesToInsert = [];

        // 2. Generate 200 Vehicles
        for (let i = 0; i < 200; i++) {
            vehiclesToInsert.push({
                registrationNumber: `WP-${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.number.int({ min: 1000, max: 9999 })}`,
                ownerName: faker.person.fullName(),
                contactNumber: `07${faker.number.int({ min: 10000000, max: 99999999 })}`,
                registeredStationId: stationId
            });
        }

        // Insert all 200 vehicles into the database at once
        const insertedVehicles = await Vehicle.insertMany(vehiclesToInsert);
        console.log(`✅ Successfully registered ${insertedVehicles.length} Tuk-Tuks!`);

        console.log('⏳ Generating 1 week of historical GPS pings for each vehicle...');
        const pingsToInsert = [];

        // 3. Generate Historical Pings for each vehicle
        // We will create 5 pings per vehicle, spread out over the last 7 days
        for (const vehicle of insertedVehicles) {
            for (let j = 0; j < 5; j++) {
                pingsToInsert.push({
                    vehicleId: vehicle._id,
                    location: {
                        type: 'Point',
                        // Simulating coordinates roughly around Colombo area
                        coordinates: [
                            faker.location.longitude({ min: 79.84, max: 79.90 }),
                            faker.location.latitude({ min: 6.85, max: 6.95 })
                        ]
                    },
                    speed: faker.number.int({ min: 10, max: 60 }),
                    // Generate a random date from the past 7 days
                    createdAt: faker.date.recent({ days: 7 })
                });
            }
        }

        // Insert the thousands of pings
        await LocationPing.insertMany(pingsToInsert);
        console.log(`✅ Successfully generated ${pingsToInsert.length} historical location pings!`);

        console.log('🎉 Simulation Data Seeding Complete!');
        process.exit();

    } catch (error) {
        console.error('❌ Error during simulation seeding:', error);
        process.exit(1);
    }
};

// Run the function
seedDatabase();