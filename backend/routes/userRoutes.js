const express = require('express');
const router = express.Router();
const {
    registerUser,
    registerPartner,
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
    updateChefSettings,
    getFeaturedChefs,
    getAllChefs,
    getChefById,
    toggleFollowChef,
    addAddress,
    deleteAddress,
    addPaymentMethod,
    deletePaymentMethod,
    getUserFavourites,
    getCustomerWallet,
    topUpCustomerWallet,
    changePassword
} = require('../controllers/userController');
const { authUser, verifyOtp } = require('../controllers/authController');
const { protect, superAdmin, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/register-partner', registerPartner);
router.post('/login', authUser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/operating-hours', protect, updateOperatingHours);
router.put('/chef-settings', protect, updateChefSettings);
router.get('/admin-location', getAdminLocation);
router.get('/check-roles', checkRoleAvailability);
router.get('/chefs', getAllChefs);
router.get('/chefs/featured', getFeaturedChefs);
router.get('/chef/:id', getChefById);
router.get('/all-management', protect, admin, getAllManagement);
router.delete('/:id', protect, superAdmin, deleteUser);
router.put('/update-status', protect, admin, updateUserStatus);
router.post('/bulk-delete', protect, superAdmin, bulkDeleteUsers);
router.get('/favourites', protect, getUserFavourites);
router.put('/follow/:id', protect, toggleFollowChef);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.post('/payment-methods', protect, addPaymentMethod);
router.delete('/payment-methods/:id', protect, deletePaymentMethod);
router.get('/wallet', protect, getCustomerWallet);
router.post('/wallet/topup', protect, topUpCustomerWallet);
router.put('/change-password', protect, changePassword);

module.exports = router;
