const express = require('express');
const router = express.Router();
const { handleRazorpayWebhook } = require('../controllers/webhookController');

// Razorpay Webhook Endpoint
router.post('/razorpay', handleRazorpayWebhook);

module.exports = router;
