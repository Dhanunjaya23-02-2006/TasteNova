const Banner = require('../models/Banner');
const Notification = require('../models/Notification');
const Offer = require('../models/Offer');
const MarketingCampaign = require('../models/MarketingCampaign');

// @desc    Get all banners
// @route   GET /api/superadmin/marketing/banners
// @access  Private/SuperAdmin
const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a banner
// @route   POST /api/superadmin/marketing/banners
// @access  Private/SuperAdmin
const createBanner = async (req, res) => {
    try {
        const { title, imageUrl, linkUrl, isActive, displayOrder } = req.body;
        const banner = await Banner.create({ title, imageUrl, linkUrl, isActive, displayOrder });
        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a banner
// @route   PUT /api/superadmin/marketing/banners/:id
// @access  Private/SuperAdmin
const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a banner
// @route   DELETE /api/superadmin/marketing/banners/:id
// @access  Private/SuperAdmin
const deleteBanner = async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a notification blast
// @route   POST /api/superadmin/marketing/notifications/send
// @access  Private/SuperAdmin
const sendNotification = async (req, res) => {
    try {
        const { title, body, targetAudience, targetCity, type } = req.body;
        
        // In a real app, you would integrate Firebase Admin SDK here or SendGrid
        // e.g. await firebaseAdmin.messaging().sendToTopic(targetAudience, { notification: { title, body } })

        const notification = await Notification.create({
            title,
            body,
            targetAudience,
            targetCity: targetCity || null,
            sentBy: req.user._id,
            type: type || 'Push'
        });

        res.status(201).json({ message: 'Blast sent successfully', notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sent notifications log
// @route   GET /api/superadmin/marketing/notifications
// @access  Private/SuperAdmin
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('targetCity', 'name')
            .populate('sentBy', 'name')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active public banners (localized)
// @route   GET /api/banners/active
// @access  Public
const getPublicBanners = async (req, res) => {
    try {
        const { cityId } = req.query;
        const query = { isActive: true };
        
        if (cityId) {
            query.$or = [
                { type: 'Global' },
                { type: 'City', targetCity: cityId },
                { type: 'Chef' },
                { type: 'Festival' }
            ];
        } else {
            query.type = 'Global';
        }

        // Add logic to filter out expired Festival banners if needed, but for now just fetch
        const banners = await Banner.find(query).sort({ displayOrder: 1, createdAt: -1 }).lean();
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get marketing campaigns (Chefs)
// @route   GET /api/marketing/campaigns
// @access  Private/Chef
const getCampaigns = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'chef') {
            query.chef = req.user._id;
        } else if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        const campaigns = await MarketingCampaign.find(query).populate('menuItem', 'name').sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
    }
};

// @desc    Create marketing campaign request
// @route   POST /api/marketing/campaigns
// @access  Private/Chef
const createCampaign = async (req, res) => {
    try {
        const { type, menuItem, startDate, endDate, budget, notes } = req.body;
        
        const campaign = await MarketingCampaign.create({
            type,
            chef: req.user._id,
            menuItem: type === 'Promote Dish' ? menuItem : null,
            startDate,
            endDate,
            budget,
            notes
        });

        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ message: 'Error creating campaign', error: error.message });
    }
};

module.exports = {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    sendNotification,
    getNotifications,
    getPublicBanners,
    getCampaigns,
    createCampaign
};
