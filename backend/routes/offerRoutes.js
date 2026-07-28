const express = require('express');
const router = express.Router();
const { getOffers, createOffer, updateOfferStatus } = require('../controllers/offerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOffers)
    .post(protect, createOffer);

router.route('/:id/status')
    .put(protect, updateOfferStatus);

module.exports = router;
