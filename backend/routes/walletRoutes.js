const express = require('express');
const router = express.Router();
const { getWalletInfo } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.route('/wallet')
    .get(protect, getWalletInfo);

module.exports = router;
