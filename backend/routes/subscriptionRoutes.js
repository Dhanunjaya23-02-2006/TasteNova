const express = require('express');
const router = express.Router();
const {
    getSubscriptionPlans,
    createSubscriptionPlan,
    purchaseSubscription,
    getMySubscriptions
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/plans')
    .get(getSubscriptionPlans)
    .post(protect, createSubscriptionPlan);

router.post('/subscribe', protect, purchaseSubscription);
router.get('/my', protect, getMySubscriptions);

module.exports = router;
