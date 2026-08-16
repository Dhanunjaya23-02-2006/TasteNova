const express = require('express');
const router = express.Router();
const { protect, superAdmin } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/superadminController');

// All routes require authentication + superadmin role
router.use(protect, superAdmin);

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Cities
router.get('/cities', ctrl.getCities);
router.post('/cities', ctrl.createCity);
router.put('/cities/:id', ctrl.updateCity);

// Sub-Admins
router.get('/subadmins', ctrl.getSubAdmins);
router.post('/subadmins', ctrl.createSubAdmin);
router.put('/subadmins/:id', ctrl.updateSubAdmin);

// Analytics
router.get('/business-analytics', ctrl.getBusinessAnalytics);
router.get('/city-analytics', ctrl.getCityAnalytics);

// Verification Queue
router.get('/verification', ctrl.getVerificationQueue);
router.put('/verification/:id', ctrl.verifyUser);

// Audit Logs
router.get('/audit-logs', ctrl.getAuditLogs);

// Operations Module
router.get('/orders', ctrl.getOrders);
router.get('/chefs', ctrl.getChefs);
router.get('/delivery', ctrl.getDelivery);
router.get('/customers', ctrl.getCustomers);
router.get('/customer-stats', ctrl.getCustomerStats);
router.get('/customers/:id', ctrl.getCustomerDetail);
router.put('/customers/:id/status', ctrl.updateCustomerStatus);
router.get('/support', ctrl.getSupportTickets);

// ========================
// FINANCE MODULE
// ========================
router.get('/finance/revenue', ctrl.getRevenue);
router.get('/finance/commissions', ctrl.getCommissions);
router.put('/finance/commissions/global', ctrl.updateGlobalCommission);
router.put('/finance/commissions/chef/:id', ctrl.updateChefCommission);
router.get('/finance/payouts', ctrl.getPayouts);
router.post('/finance/payouts/batch', ctrl.processBatchPayout);
router.get('/finance/refunds', ctrl.getRefunds);
router.put('/finance/refunds/:id', ctrl.updateRefundStatus);
router.get('/finance/taxes', ctrl.getTaxes);
router.post('/finance/taxes', ctrl.createTax);
router.put('/finance/taxes/:id', ctrl.updateTax);
router.get('/finance/wallets', ctrl.getWallets);

// ========================
// MARKETING MODULE
// ========================
router.get('/marketing/offers', ctrl.getOffers);
router.post('/marketing/offers', ctrl.createOffer);
router.put('/marketing/offers/:id', ctrl.updateOffer);
router.delete('/marketing/offers/:id', ctrl.deleteOffer);

router.get('/marketing/banners', ctrl.getBanners);
router.post('/marketing/banners', ctrl.createBanner);
router.put('/marketing/banners/:id', ctrl.updateBanner);
router.delete('/marketing/banners/:id', ctrl.deleteBanner);

router.get('/marketing/campaigns', ctrl.getCampaigns);
router.put('/marketing/campaigns/:id', ctrl.updateCampaign);

router.get('/marketing/featured', ctrl.getFeaturedChefs);
router.put('/marketing/featured/:id', ctrl.toggleFeaturedChef);

// ========================
// RBAC (ROLES)
// ========================
router.get('/roles', ctrl.getRoles);
router.post('/roles', ctrl.createRole);
router.put('/roles/:id', ctrl.updateRole);
router.delete('/roles/:id', ctrl.deleteRole);

// ========================
// CATEGORIES
// ========================
router.get('/categories', ctrl.getCategories);
router.post('/categories', ctrl.createCategory);
router.put('/categories/:id', ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

// ========================
// PLATFORM SETTINGS & HEALTH
// ========================
router.get('/settings', ctrl.getGlobalSettings);
router.put('/settings', ctrl.updateGlobalSettings);
router.get('/system-health', ctrl.getSystemHealth);

module.exports = router;
