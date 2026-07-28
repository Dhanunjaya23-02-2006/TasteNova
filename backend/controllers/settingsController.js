const Settings = require('../models/Settings');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({}); // Create default if it doesn't exist
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    const { 
        cartDiscountThreshold, 
        cartDiscountPercentage, 
        cartDiscountActive,
        bookingDiscountThreshold,
        bookingDiscountPercentage,
        bookingDiscountActive,
        menuDiscountPercentage,
        menuDiscountActive
    } = req.body;

    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.cartDiscountThreshold = cartDiscountThreshold !== undefined ? cartDiscountThreshold : settings.cartDiscountThreshold;
        settings.cartDiscountPercentage = cartDiscountPercentage !== undefined ? cartDiscountPercentage : settings.cartDiscountPercentage;
        settings.cartDiscountActive = cartDiscountActive !== undefined ? cartDiscountActive : settings.cartDiscountActive;
        
        settings.bookingDiscountThreshold = bookingDiscountThreshold !== undefined ? bookingDiscountThreshold : settings.bookingDiscountThreshold;
        settings.bookingDiscountPercentage = bookingDiscountPercentage !== undefined ? bookingDiscountPercentage : settings.bookingDiscountPercentage;
        settings.bookingDiscountActive = bookingDiscountActive !== undefined ? bookingDiscountActive : settings.bookingDiscountActive;

        settings.menuDiscountPercentage = menuDiscountPercentage !== undefined ? menuDiscountPercentage : settings.menuDiscountPercentage;
        settings.menuDiscountActive = menuDiscountActive !== undefined ? menuDiscountActive : settings.menuDiscountActive;

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

module.exports = { getSettings, updateSettings };
