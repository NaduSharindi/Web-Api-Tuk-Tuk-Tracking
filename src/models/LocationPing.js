import mongoose from 'mongoose';

const locationPingSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    speed: { type: Number, default: 0 }
}, { timestamps: true });

// Index for geospatial queries
locationPingSchema.index({ location: '2dsphere' });

export default mongoose.model('LocationPing', locationPingSchema);