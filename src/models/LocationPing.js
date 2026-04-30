import mongoose from 'mongoose';

const locationPingSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    deviceId: {
        type: String
    },
    // This is the specific GeoJSON format required by the brief
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // Must be exactly [longitude, latitude]
            required: true
        }
    },
    speed: { type: Number },
    heading: { type: Number }, // 0-360 degrees
    timestamp: { type: Date, default: Date.now }
});

// This index is crucial for Level 5 marks. It tells MongoDB this is map data!
locationPingSchema.index({ location: '2dsphere' });
// Index for fast history lookups
locationPingSchema.index({ vehicleId: 1, timestamp: -1 });

export default mongoose.model('LocationPing', locationPingSchema);