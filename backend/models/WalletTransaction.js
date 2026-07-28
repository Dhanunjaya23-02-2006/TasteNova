const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    wallet_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    type: {
        type: String,
        enum: ['credit', 'debit', 'refund', 'adjustment', 'commission'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'reversed', 'failed'],
        default: 'pending'
    },
    idempotency_key: {
        type: String,
        sparse: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
