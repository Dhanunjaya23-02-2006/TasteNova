const express = require('express');
const router = express.Router();
const { getCities, createCity, updateCityStatus, updateCity, deleteCity } = require('../controllers/cityController');
const { protect, superAdmin, admin } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Get all cities (Public route, often hit during onboarding, perfect for caching)
router.get('/', cacheMiddleware('1h'), getCities);

router.post('/', protect, admin, createCity);
router.put('/:id', protect, admin, updateCity);
router.put('/:id/status', protect, admin, updateCityStatus);
router.delete('/:id', protect, admin, deleteCity);

module.exports = router;
