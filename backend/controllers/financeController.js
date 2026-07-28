const User = require('../models/User');
const City = require('../models/City');
const GlobalSetting = require('../models/GlobalSetting');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Payout = require('../models/Payout');
const walletService = require('../services/walletService');

// @desc    Get all commission settings (Global, Cities, Chefs)
// @route   GET /api/superadmin/finance/commissions
// @access  Private/SuperAdmin
const getCommissionSettings = async (req, res) => {
    try {
        // 1. Get Global Default
        let globalSetting = await GlobalSetting.findOne({ key: 'default_commission' });
        if (!globalSetting) {
            globalSetting = await GlobalSetting.create({ key: 'default_commission', value: 15, description: 'Default platform commission rate (%)' });
        }

        // 2. Get City Overrides (Only cities that have a custom rate)
        const cities = await City.find({ commissionRate: { $exists: true, $ne: null } }).select('name state commissionRate');

        // 3. Get Chef Overrides (Only chefs that have a custom rate)
        const chefs = await User.find({ role: 'chef', commissionRate: { $exists: true, $ne: null } })
            .select('name kitchenName email commissionRate city')
            .populate('city', 'name');

        // Get list of all cities and chefs for the dropdowns
        const allCities = await City.find({ isActive: true }).select('name state');
        const allChefs = await User.find({ role: 'chef' }).select('name kitchenName');

        res.json({
            global: globalSetting.value,
            cityOverrides: cities,
            chefOverrides: chefs,
            allCities,
            allChefs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Global Commission
// @route   PUT /api/superadmin/finance/commissions/global
// @access  Private/SuperAdmin
const updateGlobalCommission = async (req, res) => {
    try {
        const { rate } = req.body;
        const globalSetting = await GlobalSetting.findOneAndUpdate(
            { key: 'default_commission' },
            { value: Number(rate) },
            { new: true, upsert: true }
        );
        res.json({ success: true, global: globalSetting.value });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update City Commission Override
// @route   PUT /api/superadmin/finance/commissions/city/:id
// @access  Private/SuperAdmin
const updateCityCommission = async (req, res) => {
    try {
        const { rate } = req.body;
        // if rate is null/empty string, it unsets the override
        const updateData = (rate === null || rate === '') 
            ? { $unset: { commissionRate: 1 } }
            : { commissionRate: Number(rate) };

        const city = await City.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, city });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Chef Commission Override
// @route   PUT /api/superadmin/finance/commissions/chef/:id
// @access  Private/SuperAdmin
const updateChefCommission = async (req, res) => {
    try {
        const { rate } = req.body;
        const updateData = (rate === null || rate === '') 
            ? { $unset: { commissionRate: 1 } }
            : { commissionRate: Number(rate) };

        const chef = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ success: true, chef });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Platform Revenue Stats
// @route   GET /api/superadmin/finance/revenue
// @access  Private/SuperAdmin
const getRevenueStats = async (req, res) => {
    try {
        // We calculate total GMV (Gross Merchandise Value) from all completed/delivered orders
        // And calculate estimated platform revenue based on commission
        const orders = await Order.find({ orderStatus: { $in: ['Delivered', 'Completed'] } });

        let totalGmv = 0;
        let estimatedRevenue = 0; // Simplified estimation for now (assumes 15% average if we don't calculate historically)
        
        // For a true historical system, we should save the exact commission amount on each order document.
        // For this view, we'll estimate based on the current orders.
        orders.forEach(order => {
            totalGmv += order.totalPrice;
            estimatedRevenue += (order.totalPrice * 0.15); // Hardcoded 15% estimation for dashboard view
        });

        res.json({
            totalGmv,
            estimatedRevenue,
            totalOrders: orders.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Wallets with Balances
// @route   GET /api/superadmin/finance/wallets
// @access  Private/SuperAdmin
const getWallets = async (req, res) => {
    try {
        const wallets = await Wallet.find().populate('user_id', 'name email role bankDetails');
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Settle Escrow (Move Pending to Available)
// @route   POST /api/superadmin/finance/wallets/:id/settle
// @access  Private/SuperAdmin
const settleEscrow = async (req, res) => {
    try {
        const wallet = await Wallet.findById(req.params.id);
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

        const amountToSettle = wallet.pending_balance;
        if (amountToSettle <= 0) return res.status(400).json({ message: 'No pending balance to settle' });

        const idempotencyKey = `manual_settle_${wallet._id}_${Date.now()}`;
        await walletService.settleEscrow(wallet._id, amountToSettle, idempotencyKey, req.user._id);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request Payout
// @route   POST /api/superadmin/finance/payout/request/:walletId
// @access  Private/SuperAdmin
const requestPayout = async (req, res) => {
    try {
        const wallet = await Wallet.findById(req.params.walletId);
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

        const payoutAmount = wallet.available_balance;
        if (payoutAmount <= 0) return res.status(400).json({ message: 'No available balance' });

        const payout = await Payout.create({
            chef_id: wallet.user_id,
            amount: payoutAmount,
            status: 'Requested'
        });

        const idempotencyKey = `payout_lock_${payout._id}`;
        await walletService.lockForPayout(wallet._id, payoutAmount, payout._id, idempotencyKey, req.user._id);

        res.json({ success: true, payout });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Payout Status
// @route   POST /api/superadmin/finance/payout/:payoutId/status
// @access  Private/SuperAdmin
const updatePayoutStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const payout = await Payout.findById(req.params.payoutId);
        if (!payout) return res.status(404).json({ message: 'Payout not found' });

        const wallet = await Wallet.findOne({ user_id: payout.chef_id });

        if (status === 'Paid') {
            if (payout.status === 'Paid') return res.status(400).json({ message: 'Already paid' });
            
            const idempotencyKey = `payout_debit_${payout._id}`;
            await walletService.processPayoutDebit(wallet._id, payout.amount, payout._id, idempotencyKey, req.user._id);

            payout.status = 'Paid';
            payout.paid_at = new Date();
            await payout.save();
        } else if (status === 'Failed' || status === 'Cancelled') {
            const idempotencyKey = `payout_unlock_${payout._id}_${Date.now()}`;
            await walletService.unlockFailedPayout(wallet._id, payout.amount, payout._id, idempotencyKey, req.user._id);

            payout.status = status;
            await payout.save();
        } else {
            payout.status = status; // Approved, Processing
            await payout.save();
        }

        res.json({ success: true, payout });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Payouts
// @route   GET /api/superadmin/finance/payouts
// @access  Private/SuperAdmin
const getPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find().populate('chef_id', 'name email role bankDetails');
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCommissionSettings,
    updateGlobalCommission,
    updateCityCommission,
    updateChefCommission,
    getRevenueStats,
    getWallets,
    settleEscrow,
    requestPayout,
    updatePayoutStatus,
    getPayouts
};
