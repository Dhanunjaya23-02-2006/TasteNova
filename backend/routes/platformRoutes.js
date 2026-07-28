const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getDeliverySettings,
    updateDeliverySettings
} = require('../controllers/platformController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

// Categories
router.route('/categories')
    .get(getCategories)
    .post(protect, superAdmin, createCategory);

router.route('/categories/:id')
    .put(protect, superAdmin, updateCategory)
    .delete(protect, superAdmin, deleteCategory);

// Delivery Settings
router.route('/delivery-settings')
    .get(getDeliverySettings)
    .put(protect, superAdmin, updateDeliverySettings);

module.exports = router;
