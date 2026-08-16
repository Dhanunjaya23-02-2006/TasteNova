const express = require('express');
const router = express.Router();
const { getReferralStats } = require('../controllers/referralController');
const { protect } = require('../middleware/authMiddleware');

router.route('/stats').get(protect, getReferralStats);

module.exports = router;
