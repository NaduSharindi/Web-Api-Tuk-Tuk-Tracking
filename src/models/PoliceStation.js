import mongoose from 'mongoose';

const policeStationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // Required by spec
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },

    // The exact GeoJSON format required for map tracking
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },

    // --- The two missing fields you asked about! ---
    address: { type: String },
    contactNumber: { type: String }
    // -----------------------------------------------

}, { timestamps: true });

// This makes map-based queries (like "find nearest station") super fast
policeStationSchema.index({ location: '2dsphere' });

export default mongoose.model('PoliceStation', policeStationSchema);