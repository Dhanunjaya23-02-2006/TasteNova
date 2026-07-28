const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    cartDiscountThreshold: { type: Number, default: 400 },
    cartDiscountPercentage: { type: Number, default: 10 },
    cartDiscountActive: { type: Boolean, default: false },
    bookingDiscountThreshold: { type: Number, default: 20 }, // e.g. 20 guests
    bookingDiscountPercentage: { type: Number, default: 5 },  // e.g. 5% off advance
    bookingDiscountActive: { type: Boolean, default: false },
    menuDiscountPercentage: { type: Number, default: 10 },
    menuDiscountActive: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
