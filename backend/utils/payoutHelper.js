const walletService = require('../services/walletService');
const User = require('../models/User');
const City = require('../models/City');
const GlobalSetting = require('../models/GlobalSetting');

const processOrderPayout = async (order) => {
    try {
        if (order.payoutStatus === 'Paid') return; // Already processed

        // 1. Determine Commission Rate
        let commissionRate = 15; // fallback
        const globalSetting = await GlobalSetting.findOne({ key: 'default_commission' });
        if (globalSetting) commissionRate = globalSetting.value;

        // Check City override
        if (order.city) {
            const city = await City.findById(order.city);
            if (city && city.commissionRate !== null && city.commissionRate !== undefined) {
                commissionRate = city.commissionRate;
            }
        }

        // Check Chef override
        const chef = await User.findById(order.chef);
        if (chef && chef.commissionRate !== null && chef.commissionRate !== undefined) {
            commissionRate = chef.commissionRate;
        }

        // 2. Calculate Payouts
        const foodTotal = order.totalPrice - order.deliveryFee - order.taxPrice; 
        const platformCommission = (foodTotal * commissionRate) / 100;
        const chefEarnings = foodTotal - platformCommission;

        const deliveryEarnings = order.deliveryFee; // Assuming 100% of delivery fee goes to partner for now

        // 3. Credit Chef Wallet (Pending Escrow)
        await walletService.creditPending(
            order.chef, 
            chefEarnings, 
            order._id, 
            'Order Delivery', 
            'chef', 
            'System'
        );

        // 4. Credit Delivery Partner Wallet (Pending Escrow)
        if (order.deliveryPartner && deliveryEarnings > 0) {
            await walletService.creditPending(
                order.deliveryPartner, 
                deliveryEarnings, 
                order._id, 
                'Delivery Fee', 
                'delivery', 
                'System'
            );
        }

        // 5. Update Order status
        order.payoutStatus = 'Paid';
        order.chefPayout = chefEarnings;
        order.deliveryPartnerPayout = deliveryEarnings;
        order.chefPayoutStatus = 'Paid'; // internal ledger marks it as paid to wallet
        order.escrow_status = 'pending';
        order.deliveredAt = new Date();
        await order.save();

        console.log(`Payout processed for Order ${order._id}`);
    } catch (error) {
        console.error('Error processing payout:', error);
    }
};

module.exports = { processOrderPayout };
