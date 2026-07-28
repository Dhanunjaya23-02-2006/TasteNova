const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    isActive: { type: Boolean, default: true },
    latitude: { type: Number },
    longitude: { type: Number },
    deliveryRadius: { type: Number, default: 10 }, // in km
    commissionRate: { type: Number }, // City-specific Commission Override (optional)
    baseDeliveryFee: { type: Number, default: 40 }, // Base fee for delivery
    perKmFee: { type: Number, default: 10 }, // Fee per extra km
    freeDeliveryThreshold: { type: Number, default: 500 } // Free delivery over this amount
}, { timestamps: true });

// Prevent duplicate cities in the same state
citySchema.index({ name: 1, state: 1 }, { unique: true });

module.exports = mongoose.model('City', citySchema);
