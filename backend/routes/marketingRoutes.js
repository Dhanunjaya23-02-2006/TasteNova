const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign } = require('../controllers/marketingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/campaigns')
    .get(protect, getCampaigns)
    .post(protect, createCampaign);

module.exports = router;
