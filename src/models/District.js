import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema({
    name: { type: String, required: true },
    provinceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true }
}, { timestamps: true });

export default mongoose.model('District', districtSchema);