const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getAdminBookings, acceptBooking, rejectBooking } = require('../controllers/chefBookingController');
const { protect, admin, chef } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createBooking)
    .get(protect, chef, getAdminBookings);

router.route('/mybookings')
    .get(protect, getUserBookings);

router.route('/:id/accept')
    .put(protect, chef, acceptBooking);

router.route('/:id/reject')
    .put(protect, chef, rejectBooking);

module.exports = router;
