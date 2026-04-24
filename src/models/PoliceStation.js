import mongoose from 'mongoose';

const policeStationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true }
}, { timestamps: true });

export default mongoose.model('PoliceStation', policeStationSchema);