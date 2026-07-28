const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    chef_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    bank_reference: {
        type: String
    },
    status: {
        type: String,
        enum: ['Requested', 'Approved', 'Processing', 'Paid', 'Failed', 'Cancelled'],
        default: 'Requested'
    },
    paid_at: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
