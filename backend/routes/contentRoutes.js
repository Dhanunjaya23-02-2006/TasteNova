const express = require('express');
const router = express.Router();
const { getPageContent, updatePageContent } = require('../controllers/contentController');
const { protect, superAdmin } = require('../middleware/authMiddleware');

router.get('/:slug', getPageContent);
router.put('/:slug', protect, superAdmin, updatePageContent);

module.exports = router;
