const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    maxDiscountAmount: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    scope: { type: String, enum: ['Global', 'City'], required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // Required if scope is 'City'
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Who created this offer (Sub-admin or Super Admin)
}, { timestamps: true });

// Validation: Ensure city is provided if scope is 'City'
offerSchema.pre('save', function(next) {
    if (this.scope === 'City' && !this.city) {
        next(new Error('City must be specified for City-scoped offers.'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Offer', offerSchema);
