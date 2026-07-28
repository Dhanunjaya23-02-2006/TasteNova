const express = require('express');
const router = express.Router();
const { protect, superAdmin } = require('../middleware/authMiddleware');
const {
    getUsersByRole,
    updateUserRole,
    createUserDirectly,
    getGlobalOrders,
    cancelOrder,
    getPlatformStats,
    getAnalytics
} = require('../controllers/superadminController');

const {
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
} = require('../controllers/financeController');

const {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    sendNotification,
    getNotifications
} = require('../controllers/marketingController');

router.use(protect);
router.use(superAdmin);

// User Management
router.get('/users/:role', getUsersByRole);
router.put('/users/:id/role', updateUserRole);
router.post('/users', createUserDirectly);

// Orders Management
router.get('/orders', getGlobalOrders);
router.post('/orders/:id/cancel', cancelOrder);

const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Analytics (Cache heavily to reduce DB load for dashboard renders)
router.get('/stats', cacheMiddleware('5m'), getPlatformStats);
router.get('/analytics', cacheMiddleware('5m'), getAnalytics);

// Finance & Commissions
router.get('/finance/commissions', getCommissionSettings);
router.put('/finance/commissions/global', updateGlobalCommission);
router.put('/finance/commissions/city/:id', updateCityCommission);
router.put('/finance/commissions/chef/:id', updateChefCommission);
router.get('/finance/revenue', getRevenueStats);
router.get('/finance/wallets', getWallets);
router.post('/finance/wallets/:id/settle', settleEscrow);
router.get('/finance/payouts', getPayouts);
router.post('/finance/payout/request/:walletId', requestPayout);
router.post('/finance/payout/:payoutId/status', updatePayoutStatus);

// Marketing
router.route('/marketing/banners')
    .get(getBanners)
    .post(createBanner);
router.route('/marketing/banners/:id')
    .put(updateBanner)
    .delete(deleteBanner);

router.post('/marketing/notifications/send', sendNotification);
router.get('/marketing/notifications', getNotifications);

module.exports = router;
