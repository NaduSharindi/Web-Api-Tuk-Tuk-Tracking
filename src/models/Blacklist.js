import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '1d' } // Automatically deletes after 1 day to save database space!
});

export default mongoose.model('Blacklist', blacklistSchema);