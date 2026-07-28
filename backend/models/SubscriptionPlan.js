const mongoose = require('mongoose');

const subscriptionPlanSchema = mongoose.Schema({
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // e.g. "Weekly Veg Lunch"
    description: { type: String, required: true },
    type: { type: String, enum: ['Weekly', 'Monthly'], required: true },
    mealType: { type: String, enum: ['Lunch', 'Dinner', 'Both'], required: true },
    price: { type: Number, required: true }, // All-inclusive price (food + delivery + platform)
    
    // Fixed menu schedule. For each day, 1-3 menu items can be selected by the customer.
    weeklyMenu: {
        monday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
        tuesday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
        wednesday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
        thursday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
        friday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
        saturday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
        sunday: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }]
    },
    
    isActive: { type: Boolean, default: true } // Chef can disable plans

}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
