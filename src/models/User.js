import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // --- 1. UPDATED: Spec requires these specific lowercase roles ---
    role: {
        type: String,
        enum: ['admin', 'provincial', 'station', 'device'],
        required: true
    },

    // --- 2. NEW: Spec requires these geographic and tracking fields ---
    provinceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
    lastLogin: { type: Date }
    // ----------------------------------------------------------------

}, { timestamps: true });

// Hash password before saving (Your excellent existing code is kept here!)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);