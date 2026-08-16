const express = require('express');
const router = express.Router();
const {
    getSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    purchaseSubscription,
    getMySubscriptions
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/plans')
    .get(getSubscriptionPlans)
    .post(protect, createSubscriptionPlan);

router.route('/plans/:id')
    .put(protect, updateSubscriptionPlan)
    .delete(protect, deleteSubscriptionPlan);

router.post('/subscribe', protect, purchaseSubscription);
router.get('/my', protect, getMySubscriptions);

module.exports = router;
