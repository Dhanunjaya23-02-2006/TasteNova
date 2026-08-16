const mongoose = require('mongoose');

const marketingCampaignSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['Featured Kitchen', 'Promote Dish', 'Social Media', 'Customer Re-engagement'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Active', 'Rejected', 'Completed'], 
        default: 'Pending' 
    },
    chef: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    menuItem: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'MenuItem' 
    }, // Required for "Promote Dish"
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number, default: 0 },
    notes: { type: String }, // Any additional details from the chef
    adminFeedback: { type: String } // Feedback from admin upon rejection/approval
}, { timestamps: true });

module.exports = mongoose.model('MarketingCampaign', marketingCampaignSchema);
