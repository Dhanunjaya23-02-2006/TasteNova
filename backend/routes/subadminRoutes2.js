const express = require('express');
const router = express.Router();
const { protect, subadmin, cityScope } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/subadminController');

// All routes require authentication + subadmin role + city scoping
router.use(protect, subadmin, cityScope);

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Orders
router.get('/orders', ctrl.getOrders);
router.get('/orders/:id', ctrl.getOrderById);
router.put('/orders/:id/cancel', ctrl.cancelOrder);

// Chefs
router.get('/chefs', ctrl.getChefs);
router.put('/chefs/:id/status', ctrl.updateChefStatus);

// Delivery Partners
router.get('/delivery', ctrl.getDeliveryPartners);
router.put('/delivery/:id/status', ctrl.updateDeliveryStatus);

// Customers
router.get('/customers', ctrl.getCustomers);
router.get('/customers/:id', ctrl.getCustomerById);
router.put('/customers/:id/suspend', ctrl.suspendCustomer);

// Promotions
router.get('/promotions', ctrl.getPromotions);
router.post('/promotions', ctrl.createPromotion);
router.put('/promotions/:id', ctrl.updatePromotion);

// Banners
router.get('/banners', ctrl.getBanners);
router.post('/banners', ctrl.createBanner);
router.put('/banners/:id', ctrl.updateBanner);
router.delete('/banners/:id', ctrl.deleteBanner);

// Coupons
router.get('/coupons', ctrl.getCoupons);
router.post('/coupons', ctrl.createCoupon);
router.put('/coupons/:id', ctrl.updateCoupon);

// Support Tickets
router.get('/support', ctrl.getTickets);
router.post('/support', ctrl.createTicket);
router.put('/support/:id', ctrl.updateTicket);

// Refunds
router.get('/refunds', ctrl.getRefunds);
router.put('/refunds/:id', ctrl.processRefund);

// Analytics
router.get('/analytics', ctrl.getAnalytics);

// Sub-Admin Management (For Regional Admins only)
const { admin } = require('../middleware/authMiddleware');
router.get('/subadmins', admin, ctrl.getSubAdmins);
router.post('/subadmins', admin, ctrl.createSubAdmin);
router.put('/subadmins/:id', admin, ctrl.updateSubAdmin);

module.exports = router;
