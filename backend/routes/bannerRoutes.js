const express = require('express');
const router = express.Router();
const { getPublicBanners } = require('../controllers/marketingController');

// Public routes for localized banners
router.get('/active', getPublicBanners);

module.exports = router;
