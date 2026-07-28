const express = require('express');
const router = express.Router();
const {
    getDeliveryPartners,
    createChefBooking,
    getChefBookings,
    updateChefBookingStatus,
    getAnalytics
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Delivery Partners
router.route('/delivery-partners').get(protect, admin, getDeliveryPartners);

// Analytics
router.route('/analytics').get(protect, admin, getAnalytics);

// Chef Bookings
router.route('/bookings').post(protect, createChefBooking).get(protect, admin, getChefBookings);
router.route('/bookings/:id').put(protect, admin, updateChefBookingStatus);

module.exports = router;
