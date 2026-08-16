const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    toggleOnlineStatus, 
    getOrders, 
    acceptOrder, 
    updateOrderStatus 
} = require('../controllers/deliveryController');
const { protect, delivery } = require('../middleware/authMiddleware');

// All delivery routes require a logged-in user with the 'delivery' role
router.use(protect);
router.use(delivery);

router.get('/dashboard', getDashboardStats);
router.post('/toggle-status', toggleOnlineStatus);
router.get('/orders', getOrders);
router.post('/orders/accept', acceptOrder);
router.post('/orders/update-status', updateOrderStatus);

module.exports = router;
