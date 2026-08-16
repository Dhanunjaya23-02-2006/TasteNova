const express = require('express');
const router = express.Router();
const { createReview, getChefReviews, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/myreviews', protect, getUserReviews);
router.get('/:chefId', getChefReviews);

module.exports = router;
