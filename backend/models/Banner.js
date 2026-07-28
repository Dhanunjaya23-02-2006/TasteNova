const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String },
    type: { type: String, enum: ['Global', 'City', 'Chef', 'Festival'], default: 'Global' },
    targetCity: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    targetChef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Add index for active banner queries
bannerSchema.index({ isActive: 1, type: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
