const Wallet = require('../models/Wallet');

// @desc    Get chef wallet info
// @route   GET /api/earnings/wallet
// @access  Private
const getWalletInfo = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            // Create a wallet if it doesn't exist
            wallet = await Wallet.create({ user: req.user._id });
        }
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wallet', error: error.message });
    }
};

module.exports = { getWalletInfo };
