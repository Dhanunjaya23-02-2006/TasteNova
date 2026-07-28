const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const Order = require('../models/Order');

// @desc    Get all active subscription plans for a chef
// @route   GET /api/subscriptions/plans
// @access  Public
const getSubscriptionPlans = async (req, res) => {
    try {
        const query = { isActive: true };
        if (req.query.chef) {
            query.chef = req.query.chef;
        }
        const plans = await SubscriptionPlan.find(query).populate('chef', 'name businessName rating');
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new subscription plan (Chef only)
// @route   POST /api/subscriptions/plans
// @access  Private/Chef
const createSubscriptionPlan = async (req, res) => {
    try {
        if (req.user.role !== 'chef' && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized as chef' });
        }

        const { name, description, type, mealType, price, weeklyMenu } = req.body;

        const plan = new SubscriptionPlan({
            chef: req.user._id,
            name,
            description,
            type,
            mealType,
            price,
            weeklyMenu
        });

        const createdPlan = await plan.save();
        res.status(201).json(createdPlan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Purchase a subscription plan
// @route   POST /api/subscriptions/subscribe
// @access  Private
const purchaseSubscription = async (req, res) => {
    try {
        const { planId, paymentResult, selectedTimeSlot } = req.body;

        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        const startDate = new Date();
        const endDate = new Date();
        if (plan.type === 'Weekly') {
            endDate.setDate(startDate.getDate() + 7);
        } else {
            endDate.setMonth(startDate.getMonth() + 1);
        }

        const subscription = new UserSubscription({
            user: req.user._id,
            chef: plan.chef,
            plan: plan._id,
            startDate,
            endDate,
            selectedTimeSlot,
            paymentResult,
            totalPaid: plan.price
        });

        const savedSubscription = await subscription.save();
        res.status(201).json(savedSubscription);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user's active subscriptions
// @route   GET /api/subscriptions/my
// @access  Private
const getMySubscriptions = async (req, res) => {
    try {
        const subscriptions = await UserSubscription.find({ user: req.user._id })
            .populate({
                path: 'plan',
                populate: { path: 'chef', select: 'businessName name' }
            });
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getSubscriptionPlans,
    createSubscriptionPlan,
    purchaseSubscription,
    getMySubscriptions
};
