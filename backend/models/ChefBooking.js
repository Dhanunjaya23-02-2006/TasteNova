const mongoose = require('mongoose');

const chefBookingSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactDetails: { type: String, required: true },
    partyType: { type: String, required: true }, // e.g., anniversary, birthday, festival
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    guestCount: { type: Number, required: true },
    eventDetails: { type: String },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'], default: 'Pending' },
    price: { type: Number }, // decided by admin after request
    advanceAmount: { type: Number, default: 0 },
    paymentId: { type: String },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ChefBooking', chefBookingSchema);
