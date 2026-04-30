import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true, unique: true },
    driverName: { type: String },
    driverLicense: { type: String }, // NEW
    driverPhone: { type: String },   // UPDATED
    ownerName: { type: String },
    ownerPhone: { type: String },    // UPDATED
    registeredProvinceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
    registeredDistrictId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    registeredStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
    status: {
        type: String,
        enum: ['active', 'inactive', 'flagged'],
        default: 'active'
    }, // NEW
    lastSeen: { type: Date } // NEW
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);