import mongoose from 'mongoose';

const provinceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.model('Province', provinceSchema);