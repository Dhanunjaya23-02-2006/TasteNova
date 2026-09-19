const express = require('express');
const router = express.Router();
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/platformController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

// Categories
router.route('/categories')
    .get(getCategories)
    .post(protect, superAdmin, createCategory);

router.route('/categories/:id')
    .put(protect, superAdmin, updateCategory)
    .delete(protect, superAdmin, deleteCategory);

module.exports = router;
