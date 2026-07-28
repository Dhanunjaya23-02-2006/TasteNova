const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    wallet_type: {
        type: String,
        enum: ['chef', 'delivery'],
        required: true
    },
    available_balance: {
        type: Number,
        default: 0
    },
    pending_balance: {
        type: Number,
        default: 0
    },
    locked_balance: {
        type: Number,
        default: 0
    },
    total_balance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

walletSchema.pre('save', function(next) {
    this.total_balance = this.available_balance + this.pending_balance + this.locked_balance;
    next();
});

module.exports = mongoose.model('Wallet', walletSchema);
