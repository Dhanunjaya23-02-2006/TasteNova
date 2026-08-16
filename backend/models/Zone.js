const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    deliveryRadius: { type: Number, default: 6 }, // Delivery radius in km
    description: { type: String }
}, { timestamps: true });

// Ensure unique zone name per city
zoneSchema.index({ name: 1, city: 1 }, { unique: true });

module.exports = mongoose.model('Zone', zoneSchema);
