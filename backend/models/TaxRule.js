const mongoose = require('mongoose');

const taxRuleSchema = mongoose.Schema({
    category: { type: String, required: true }, // e.g. Food & Beverage, Platform Fee, Delivery Fee, Packaging
    taxType: { type: String, required: true, default: 'GST' },
    rate: { type: Number, required: true }, // e.g. 5, 18
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('TaxRule', taxRuleSchema);
