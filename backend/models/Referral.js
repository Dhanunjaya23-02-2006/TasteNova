const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Successful'], default: 'Pending' },
    rewardAmount: { type: Number, default: 250 },
    completedAt: { type: Date }
}, { timestamps: true });

// Ensure a user can only be referred once
referralSchema.index({ referredUser: 1 }, { unique: true });
// Index for fast lookups by referrer
referralSchema.index({ referrer: 1 });

module.exports = mongoose.model('Referral', referralSchema);
