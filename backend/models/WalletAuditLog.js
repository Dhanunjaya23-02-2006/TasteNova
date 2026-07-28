const mongoose = require('mongoose');

const walletAuditLogSchema = new mongoose.Schema({
    wallet_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    action_type: {
        type: String,
        enum: ['credit', 'debit', 'settle', 'lock', 'unlock'],
        required: true
    },
    entity_type: {
        type: String,
        enum: ['wallet', 'payout', 'transaction', 'order'],
        required: true
    },
    entity_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    old_available: { type: Number, default: 0 },
    new_available: { type: Number, default: 0 },
    old_pending: { type: Number, default: 0 },
    new_pending: { type: Number, default: 0 },
    old_locked: { type: Number, default: 0 },
    new_locked: { type: Number, default: 0 },
    triggered_by: {
        type: mongoose.Schema.Types.Mixed, // Could be String "System" or ObjectId of User/Admin
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('WalletAuditLog', walletAuditLogSchema);
