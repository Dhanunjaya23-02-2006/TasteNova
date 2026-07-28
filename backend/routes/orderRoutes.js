const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    updateDeliveryStatus,
    getAssignedOrders,
    getDeliveryEarnings,
    processRefund
} = require('../controllers/orderController');
const { protect, admin, chef, delivery } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, chef, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/deliveryorders').get(protect, delivery, getAssignedOrders);
router.route('/deliveryearnings').get(protect, delivery, getDeliveryEarnings);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/status').put(protect, updateOrderStatus); // Update: Removed strict 'chef' middleware since admin/subadmin also updates status
router.route('/:id/deliverystatus').put(protect, delivery, updateDeliveryStatus);
router.route('/:id/refund').put(protect, admin, processRefund);

module.exports = router;
