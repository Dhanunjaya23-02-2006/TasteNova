const express = require('express');
const router = express.Router();
const { getWalletInfo, createTopUpOrder, verifyTopUpPayment } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.route('/wallet')
    .get(protect, getWalletInfo);

router.post('/wallet/topup/create-order', protect, createTopUpOrder);
router.post('/wallet/topup/verify', protect, verifyTopUpPayment);

module.exports = router;
