import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'STATION_OFFICER'], required: true },
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' } // Optional, for station officers
}, { timestamps: true });

// Hash password before saving (Modern Mongoose version)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);