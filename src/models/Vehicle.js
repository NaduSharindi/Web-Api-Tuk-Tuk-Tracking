import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    registeredStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation', required: true }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);