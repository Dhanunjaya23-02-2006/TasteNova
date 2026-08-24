const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Get user wallet info with transactions
// @route   GET /api/earnings/wallet
// @access  Private
const getWalletInfo = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user_id: req.user._id });
        if (!wallet) {
            // Determine wallet type based on user role
            const walletType = req.user.role === 'delivery' ? 'delivery' : 'chef';
            wallet = await Wallet.create({ user_id: req.user._id, wallet_type: walletType });
        }

        // Fetch transactions for this wallet
        let transactions = [];
        try {
            const rawTransactions = await WalletTransaction.find({ wallet_id: wallet._id }).sort({ createdAt: -1 }).limit(50);
            transactions = rawTransactions.map(txn => ({
                _id: txn._id,
                type: txn.type === 'debit' ? 'debit' : 'credit',
                amount: txn.amount,
                desc: txn.description || 
                      (txn.type === 'commission' ? 'Commission Earned' : 
                      txn.type === 'refund' ? 'Refund' :
                      txn.type === 'credit' ? 'Wallet Top-Up' : 
                      txn.type === 'debit' ? 'Wallet Debit' : 'Transaction'),
                createdAt: txn.createdAt,
                status: txn.status
            }));
        } catch (e) {
            transactions = [];
        }

        res.json({
            balance: wallet.total_balance || wallet.earningsBalance || 0,
            earningsBalance: wallet.earningsBalance || 0,
            referralCredits: wallet.referralCredits || 0,
            promotionalCredits: wallet.promotionalCredits || 0,
            pending_balance: wallet.pending_balance || 0,
            transactions: transactions
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wallet', error: error.message });
    }
};

// @desc    Create Razorpay order for wallet top-up
// @route   POST /api/earnings/wallet/topup/create-order
// @access  Private
const createTopUpOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount < 1) {
            return res.status(400).json({ message: 'Amount must be at least ₹1' });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `wallet_topup_${req.user._id}_${Date.now()}`,
            notes: {
                user_id: req.user._id.toString(),
                purpose: 'wallet_topup'
            }
        };

        const order = await instance.orders.create(options);
        
        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay create order error:', error);
        res.status(500).json({ message: 'Failed to create payment order', error: error.message });
    }
};

// @desc    Verify Razorpay payment and credit wallet
// @route   POST /api/earnings/wallet/topup/verify
// @access  Private
const verifyTopUpPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount
        } = req.body;

        // Verify the payment signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
        }

        // Payment verified — credit the wallet
        let wallet = await Wallet.findOne({ user_id: req.user._id });
        if (!wallet) {
            const walletType = req.user.role === 'delivery' ? 'delivery' : 'chef';
            wallet = await Wallet.create({ user_id: req.user._id, wallet_type: walletType });
        }

        const creditAmount = Number(amount);
        wallet.earningsBalance = (wallet.earningsBalance || 0) + creditAmount;
        await wallet.save();

        // Create a transaction record
        const transaction = await WalletTransaction.create({
            wallet_id: wallet._id,
            type: 'credit',
            amount: creditAmount,
            description: 'Wallet Top-Up via Razorpay',
            status: 'completed',
            idempotency_key: razorpay_payment_id // Prevent duplicate credits
        });

        // Also sync to User.walletBalance for backwards compatibility
        const User = require('../models/User');
        await User.updateOne(
            { _id: req.user._id },
            { $inc: { walletBalance: creditAmount } }
        );

        res.status(200).json({
            message: 'Wallet topped up successfully!',
            balance: wallet.total_balance || wallet.earningsBalance,
            transaction: {
                _id: transaction._id,
                type: 'credit',
                amount: creditAmount,
                desc: 'Wallet Top-Up via Razorpay',
                createdAt: transaction.createdAt,
                status: 'completed'
            }
        });
    } catch (error) {
        // Handle duplicate idempotency_key (payment already processed)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'This payment has already been processed.' });
        }
        console.error('Payment verification error:', error);
        res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
};

module.exports = { getWalletInfo, createTopUpOrder, verifyTopUpPayment };
