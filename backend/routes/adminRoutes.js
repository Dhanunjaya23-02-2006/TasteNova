const express = require('express');
const router = express.Router();
const { protect, admin, cityScope } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/adminController');
const opsCtrl = require('../controllers/subadminController');

// All routes require authentication + admin role + regional scope
router.use(protect, admin, cityScope);

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// City Settings
router.get('/city-settings', ctrl.getCitySettings);
router.put('/city-settings', ctrl.updateCitySettings);

// Zones Management
router.get('/zones', ctrl.getZones);
router.post('/zones', ctrl.createZone);
router.put('/zones/:id', ctrl.updateZone);
router.delete('/zones/:id', ctrl.deleteZone);

// Sub-Admin Management
router.get('/subadmins', ctrl.getSubAdmins);
router.post('/subadmins', ctrl.createSubAdmin);
router.put('/subadmins/:id', ctrl.updateSubAdmin);
router.delete('/subadmins/:id', ctrl.deleteSubAdmin);

// Operational Modules (Using subadmin controller which respects cityScope)
router.get('/orders', opsCtrl.getOrders);
router.get('/orders/:id', opsCtrl.getOrderById);
router.put('/orders/:id/cancel', opsCtrl.cancelOrder);

router.get('/chefs', opsCtrl.getChefs);
router.put('/chefs/:id/status', opsCtrl.updateChefStatus);

router.get('/customers', opsCtrl.getCustomers);
router.get('/customers/:id', opsCtrl.getCustomerById);
router.put('/customers/:id/suspend', opsCtrl.suspendCustomer);

router.get('/delivery', opsCtrl.getDeliveryPartners);
router.put('/delivery/:id/status', opsCtrl.updateDeliveryStatus);

router.get('/promotions', opsCtrl.getPromotions);
router.post('/promotions', opsCtrl.createPromotion);
router.put('/promotions/:id', opsCtrl.updatePromotion);

router.get('/banners', opsCtrl.getBanners);
router.post('/banners', opsCtrl.createBanner);
router.put('/banners/:id', opsCtrl.updateBanner);
router.delete('/banners/:id', opsCtrl.deleteBanner);

router.get('/coupons', opsCtrl.getCoupons);
router.post('/coupons', opsCtrl.createCoupon);
router.put('/coupons/:id', opsCtrl.updateCoupon);

router.get('/support', opsCtrl.getTickets);
router.post('/support', opsCtrl.createTicket);
router.put('/support/:id', opsCtrl.updateTicket);

router.get('/refunds', opsCtrl.getRefunds);
router.put('/refunds/:id', opsCtrl.processRefund);

router.get('/analytics', opsCtrl.getAnalytics);

module.exports = router;
