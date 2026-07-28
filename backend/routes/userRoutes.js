const express = require('express');
const router = express.Router();
const {
    registerUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    getAdminLocation,
    updateUserProfile,
    checkRoleAvailability,
    getAllManagement,
    deleteUser,
    updateUserStatus,
    bulkDeleteUsers,
    updateOperatingHours,
    getFeaturedChefs,
    getAllChefs,
    getChefById,
    toggleFollowChef
} = require('../controllers/userController');
const { authUser, verifyOtp } = require('../controllers/authController');
const { protect, superAdmin, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/operating-hours', protect, updateOperatingHours);
router.get('/admin-location', getAdminLocation);
router.get('/check-roles', checkRoleAvailability);
router.get('/chefs', getAllChefs);
router.get('/chefs/featured', getFeaturedChefs);
router.get('/chef/:id', getChefById);
router.get('/all-management', protect, admin, getAllManagement);
router.delete('/:id', protect, superAdmin, deleteUser);
router.put('/update-status', protect, admin, updateUserStatus);
router.post('/bulk-delete', protect, superAdmin, bulkDeleteUsers);
router.put('/follow/:id', protect, toggleFollowChef);

module.exports = router;
