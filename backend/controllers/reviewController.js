const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Add review for a chef
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    const { chefId, rating, comment } = req.body;

    if (!chefId || !rating || !comment) {
        return res.status(400).json({ message: 'Please provide chefId, rating and comment' });
    }

    try {
        const chef = await User.findById(chefId);

        if (!chef || chef.role !== 'chef') {
            return res.status(404).json({ message: 'Chef not found' });
        }

        const review = await Review.create({
            user: req.user._id,
            chef: chefId,
            rating: Number(rating),
            comment
        });

        // Recalculate chef's rating and numReviews
        const reviews = await Review.find({ chef: chefId });
        const numReviews = reviews.length;
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        chef.numReviews = numReviews;
        chef.rating = avgRating;

        await chef.save();

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all reviews for a chef
// @route   GET /api/reviews/:chefId
// @access  Public
const getChefReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ chef: req.params.chefId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createReview,
    getChefReviews
};
