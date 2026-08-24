const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['promotion', 'coupon'], default: 'promotion' },
    title: { type: String }, // e.g. "Hyderabad Lunch Offer"
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    discountPercentage: { type: Number, min: 0, max: 100 },
    discountFlat: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    scope: { type: String, enum: ['Global', 'City', 'Chef'], required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // Required if scope is 'City'
    targetChef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: chef-specific offer
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    perUserLimit: { type: Number, default: 1 },
    usageCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Who created this offer (Sub-admin or Super Admin)
}, { timestamps: true });

// Validation: Ensure city is provided if scope is 'City'
offerSchema.pre('save', function() {
    if (this.scope === 'City' && !this.city) {
        throw new Error('City must be specified for City-scoped offers.');
    }
});

module.exports = mongoose.model('Offer', offerSchema);
