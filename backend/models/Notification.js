const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    targetAudience: { type: String, enum: ['All', 'Customers', 'Chefs', 'Delivery'], default: 'All' },
    targetCity: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // Optional city scope
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Sent', 'Scheduled', 'Failed'], default: 'Sent' },
    type: { type: String, enum: ['Push', 'Email', 'SMS'], default: 'Push' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
