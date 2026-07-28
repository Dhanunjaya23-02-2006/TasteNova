const express = require('express');
const router = express.Router();
const { authUser, verifyOtp, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.post('/verify-otp', verifyOtp);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

module.exports = router;
