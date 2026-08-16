const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    
    // For personal alerts (e.g., new order for a chef)
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // Optional link to redirect when clicked

    // For broadcast marketing notifications
    targetAudience: { type: String, enum: ['All', 'Customers', 'Chefs', 'Delivery'], default: 'All' },
    targetCity: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Sent', 'Scheduled', 'Failed'], default: 'Sent' },
    type: { type: String, enum: ['Push', 'Email', 'SMS', 'InApp'], default: 'InApp' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
