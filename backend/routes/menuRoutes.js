const express = require('express');
const router = express.Router();
const { getMenuItems, createMenuItem, updateMenuItem, rateMenuItem, deleteMenuItem, getTrendingMenu } = require('../controllers/menuController');
const { protect, admin, chef } = require('../middleware/authMiddleware');

router.route('/').get(getMenuItems).post(protect, chef, createMenuItem);
router.route('/trending').get(getTrendingMenu);
router.route('/:id').put(protect, chef, updateMenuItem).delete(protect, chef, deleteMenuItem);
router.route('/:id/rate').post(protect, rateMenuItem);

module.exports = router;
