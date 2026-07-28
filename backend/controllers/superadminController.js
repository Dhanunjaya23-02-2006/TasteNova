const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcrypt');
const { APIFeatures, sendPaginatedResponse } = require('../utils/apiFeatures');

// @desc    Get all users by role
// @route   GET /api/superadmin/users/:role
// @access  Private/SuperAdmin
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        let filter = {};
        if (role !== 'all') {
            filter.role = role === 'subadmin' ? { $in: ['admin', 'subadmin'] } : role;
        }
        
        // Exclude the requesting superadmin
        filter._id = { $ne: req.user._id };

        const features = new APIFeatures(User.find(filter).select('-password -otp').populate('city', 'name state'), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        await sendPaginatedResponse(res, features, User);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role and city
// @route   PUT /api/superadmin/users/:id/role
// @access  Private/SuperAdmin
const updateUserRole = async (req, res) => {
    try {
        const { role, cityId, status } = req.body;
        const updateData = {};
        if (role) updateData.role = role;
        if (cityId !== undefined) {
            updateData.city = cityId === null ? undefined : cityId;
            if (cityId === null) {
                await User.updateOne({ _id: req.params.id }, { $unset: { city: 1 } });
            }
        }
        if (status) updateData.status = status;

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            city: updatedUser.city,
            status: updatedUser.status
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new user directly (no OTP)
// @route   POST /api/superadmin/users
// @access  Private/SuperAdmin
const createUserDirectly = async (req, res) => {
    try {
        const { name, email, password, phone, role, cityId, isApproved } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists with this email' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || '0000000000',
            role: role || 'admin',
            city: cityId || null,
            status: isApproved ? 'active' : 'pending',
            isEmailVerified: true,
            isPhoneVerified: true
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders platform-wide
// @route   GET /api/superadmin/orders
// @access  Private/SuperAdmin
const getGlobalOrders = async (req, res) => {
    try {
        const features = new APIFeatures(
            Order.find({}).populate('user', 'name email phone').populate('chef', 'name kitchenName'),
            req.query
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();

        await sendPaginatedResponse(res, features, Order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel any order
// @route   POST /api/superadmin/orders/:id/cancel
// @access  Private/SuperAdmin
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
            return res.status(400).json({ message: 'Cannot cancel this order in its current state' });
        }

        order.orderStatus = 'Cancelled';
        order.refundStatus = 'Pending';
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quick platform stats
// @route   GET /api/superadmin/stats
// @access  Private/SuperAdmin
const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalChefs = await User.countDocuments({ role: 'chef' });
        const totalDelivery = await User.countDocuments({ role: 'delivery' });
        const totalSubadmins = await User.countDocuments({ role: { $in: ['admin', 'subadmin'] } });

        res.json({
            users: totalUsers,
            chefs: totalChefs,
            delivery: totalDelivery,
            subadmins: totalSubadmins
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get analytics time-series data
// @route   GET /api/superadmin/analytics
// @access  Private/SuperAdmin
const getAnalytics = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Use $match with index on createdAt and orderStatus
        const dailyStats = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, status: 'Completed' } }, // Note: we use status: Completed as Delivered is deliveryStatus
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ dailyStats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsersByRole,
    updateUserRole,
    createUserDirectly,
    getGlobalOrders,
    cancelOrder,
    getPlatformStats,
    getAnalytics
};
