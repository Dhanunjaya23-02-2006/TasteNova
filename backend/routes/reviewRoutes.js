const express = require('express');
const router = express.Router();
const { createReview, getChefReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/:chefId', getChefReviews);

module.exports = router;
