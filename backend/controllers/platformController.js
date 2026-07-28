const Category = require('../models/Category');
const City = require('../models/City');
const GlobalSetting = require('../models/GlobalSetting');

// @desc    Get all categories
// @route   GET /api/platform/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const query = { isActive: true };
        if (req.query.type) {
            query.type = req.query.type;
        }
        const categories = await Category.find(query).sort({ displayOrder: 1 }).lean();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/platform/categories
// @access  Private/SuperAdmin
const createCategory = async (req, res) => {
    try {
        const { name, type, icon, displayOrder } = req.body;
        const category = new Category({ name, type, icon, displayOrder });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/platform/categories/:id
// @access  Private/SuperAdmin
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/platform/categories/:id
// @access  Private/SuperAdmin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global delivery settings
// @route   GET /api/platform/delivery-settings
// @access  Public
const getDeliverySettings = async (req, res) => {
    try {
        let setting = await GlobalSetting.findOne({ key: 'delivery_charges' });
        if (!setting) {
            setting = new GlobalSetting({
                key: 'delivery_charges',
                value: { baseDeliveryFee: 40, perKmFee: 10, freeDeliveryThreshold: 500 },
                description: 'Global fallback delivery settings'
            });
            await setting.save();
        }
        res.json(setting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update global delivery settings
// @route   PUT /api/platform/delivery-settings
// @access  Private/SuperAdmin
const updateDeliverySettings = async (req, res) => {
    try {
        const { baseDeliveryFee, perKmFee, freeDeliveryThreshold } = req.body;
        
        let setting = await GlobalSetting.findOne({ key: 'delivery_charges' });
        if (!setting) {
            setting = new GlobalSetting({ key: 'delivery_charges', value: {} });
        }
        
        setting.value = { baseDeliveryFee, perKmFee, freeDeliveryThreshold };
        await setting.save();
        
        res.json(setting.value);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getDeliverySettings,
    updateDeliverySettings
};
