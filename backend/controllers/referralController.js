const Referral = require('../models/Referral');
const User = require('../models/User');

// @desc    Get referral stats for a user
// @route   GET /api/referrals/stats
// @access  Private
const getReferralStats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Ensure the user has a referral code
        let user = await User.findById(userId);
        if (!user.referralCode) {
            const crypto = require('crypto');
            user.referralCode = `TN-${user.role === 'chef' ? 'CHEF' : 'DEL'}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
            await user.save();
        }

        const referrals = await Referral.find({ referrer: userId });

        const totalInvited = referrals.length;
        const successful = referrals.filter(r => r.status === 'Successful').length;
        const pending = referrals.filter(r => r.status === 'Pending').length;
        
        const totalEarned = referrals
            .filter(r => r.status === 'Successful')
            .reduce((acc, curr) => acc + curr.rewardAmount, 0);

        res.json({
            referralCode: user.referralCode,
            totalInvited,
            successful,
            pending,
            totalEarned
        });
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        res.status(500).json({ message: 'Error fetching referral stats', error: error.message });
    }
};

module.exports = { getReferralStats };
