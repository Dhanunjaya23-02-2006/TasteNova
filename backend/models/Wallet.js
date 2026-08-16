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
    available_balance: { // deprecated, use earningsBalance for withdrawable
        type: Number,
        default: 0
    },
    earningsBalance: {
        type: Number,
        default: 0
    },
    referralCredits: {
        type: Number,
        default: 0
    },
    promotionalCredits: {
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
    // total_balance logic including all balances
    this.total_balance = this.earningsBalance + this.referralCredits + this.promotionalCredits + this.pending_balance + this.locked_balance;
    // For backwards compatibility until full migration
    this.available_balance = this.earningsBalance;
    next();
});

module.exports = mongoose.model('Wallet', walletSchema);
