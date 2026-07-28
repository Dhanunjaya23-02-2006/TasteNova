const mongoose = require('mongoose');

const userSubscriptionSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    // e.g. "13:00" for Lunch slot, "20:00" for Dinner slot
    selectedTimeSlot: { type: String, required: true },
    
    status: { type: String, enum: ['Active', 'Paused', 'Cancelled', 'Completed'], default: 'Active' },
    
    // Tracking missed or skipped meals
    pausedDates: [{ type: Date }],
    skippedMeals: [{ type: Date }],

    paymentResult: {
        id: { type: String },
        status: { type: String }, 
        update_time: { type: String }
    },
    totalPaid: { type: Number, required: true }

}, { timestamps: true });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
