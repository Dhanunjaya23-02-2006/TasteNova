const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
    try {
        const query = {};
        if (req.query.chef) {
            query.chef = req.query.chef;
        }
        const items = await MenuItem.find(query).populate('chef', 'name businessName kitchenImage description rating numReviews isFssaiVerified isKitchenVerified');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get trending menu items
// @route   GET /api/menu/trending
// @access  Public
const getTrendingMenu = async (req, res) => {
    try {
        const items = await MenuItem.find({ available: true })
            .populate('chef', 'name businessName kitchenImage rating city')
            .sort({ rating: -1, numReviews: -1 })
            .limit(10)
            .lean();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = async (req, res) => {
    const { name, description, price, offerPrice, image, ingredientCost, available } = req.body;

    try {
        const item = new MenuItem({
            name,
            description,
            price,
            image,
            ingredientCost,
            offerPrice,
            available: available !== undefined ? available : true,
            chef: req.user._id
        });

        const createdItem = await item.save();
        res.status(201).json(createdItem);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
    const { name, description, price, offerPrice, image, available, ingredientCost } = req.body;

    try {
        const item = await MenuItem.findById(req.params.id);

        if (item) {
            // Check if user is admin or the chef who owns the item
            if (req.user.role !== 'admin' && item.chef.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this item' });
            }

            item.name = name || item.name;
            item.description = description || item.description;
            item.price = price || item.price;
            item.image = image || item.image;
            item.available = available !== undefined ? available : item.available;
            item.ingredientCost = ingredientCost || item.ingredientCost;
            item.offerPrice = offerPrice !== undefined ? offerPrice : item.offerPrice;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Rate a menu item
// @route   POST /api/menu/:id/rate
// @access  Private
const rateMenuItem = async (req, res) => {
    const { rating } = req.body;

    if (rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }

    try {
        const item = await MenuItem.findById(req.params.id);

        if (item) {
            const currentTotalRating = item.rating * item.numReviews;
            item.numReviews += 1;
            item.rating = (currentTotalRating + Number(rating)) / item.numReviews;

            await item.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);

        if (item) {
            // Check ownership
            if (req.user.role !== 'admin' && item.chef.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to delete this item' });
            }
            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMenuItems,
    getTrendingMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    rateMenuItem
};
