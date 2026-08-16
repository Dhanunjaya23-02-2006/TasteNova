const Order = require('../models/Order');
const User = require('../models/User');
const Offer = require('../models/Offer');
const Banner = require('../models/Banner');
const SupportTicket = require('../models/SupportTicket');
const GlobalSetting = require('../models/GlobalSetting');

// ========================
// DASHBOARD
// ========================
const getDashboard = async (req, res) => {
    try {
        const cityFilter = req.cityFilter;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            todayOrders,
            totalChefs,
            pendingChefs,
            totalDelivery,
            totalCustomers,
            openTickets,
            pendingRefunds,
            activePromotions
        ] = await Promise.all([
            Order.find({ ...cityFilter, createdAt: { $gte: today } }),
            User.countDocuments({ ...cityFilter, role: 'chef', status: 'active' }),
            User.countDocuments({ ...cityFilter, role: 'chef', status: 'pending' }),
            User.countDocuments({ ...cityFilter, role: 'delivery', status: 'active' }),
            User.countDocuments({ ...cityFilter, role: 'user' }),
            SupportTicket.countDocuments({ ...cityFilter, status: { $in: ['open', 'in_progress'] } }),
            Order.countDocuments({ ...cityFilter, refundStatus: 'Pending' }),
            Offer.countDocuments({ ...cityFilter, isActive: true, validUntil: { $gte: new Date() } })
        ]);

        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        // Recent orders needing attention (placed/accepted but not moving)
        const liveOrders = await Order.find({
            ...cityFilter,
            status: { $in: ['Placed', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery'] }
        })
        .populate('user', 'name phone')
        .populate('chef', 'name kitchenName')
        .sort({ createdAt: -1 })
        .limit(10);

        // Recent support tickets
        const recentTickets = await SupportTicket.find(cityFilter)
            .populate('customer', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            stats: {
                todayOrders: todayOrders.length,
                todayRevenue,
                totalChefs,
                pendingChefs,
                totalDelivery,
                totalCustomers,
                openTickets,
                pendingRefunds,
                activePromotions
            },
            liveOrders,
            recentTickets
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
    }
};

// ========================
// ORDERS
// ========================
const getOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const filter = { ...req.cityFilter };
        if (status && status !== 'All') filter.status = status;

        const orders = await Order.find(filter)
            .populate('user', 'name phone email')
            .populate('chef', 'name kitchenName')
            .populate('deliveryPartner', 'name phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Order.countDocuments(filter);

        res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, ...req.cityFilter })
            .populate('user', 'name phone email addresses')
            .populate('chef', 'name kitchenName phone')
            .populate('deliveryPartner', 'name phone')
            .populate('orderItems.menuItem', 'name');
        if (!order) return res.status(404).json({ message: 'Order not found in your city' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, ...req.cityFilter });
        if (!order) return res.status(404).json({ message: 'Order not found in your city' });
        if (['Completed', 'Rejected'].includes(order.status)) {
            return res.status(400).json({ message: 'Cannot cancel a completed or rejected order' });
        }
        order.status = 'Rejected';
        await order.save();
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.json({ message: 'Order cancelled', order });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
};

// ========================
// CHEFS
// ========================
const getChefs = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const filter = { ...req.cityFilter, role: 'chef' };
        if (status && status !== 'All') filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { kitchenName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const chefs = await User.find(filter)
            .select('-password -refreshTokens')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);
        res.json({ chefs, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chefs', error: error.message });
    }
};

const updateChefStatus = async (req, res) => {
    try {
        const { status } = req.body; // active, suspended, pending
        const chef = await User.findOne({ _id: req.params.id, ...req.cityFilter, role: 'chef' });
        if (!chef) return res.status(404).json({ message: 'Chef not found in your city' });

        chef.status = status;
        await chef.save();
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.json({ message: `Chef status updated to ${status}`, chef: { _id: chef._id, name: chef.name, status: chef.status } });
    } catch (error) {
        res.status(500).json({ message: 'Error updating chef status', error: error.message });
    }
};

// ========================
// DELIVERY PARTNERS
// ========================
const getDeliveryPartners = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = { ...req.cityFilter, role: 'delivery' };
        if (status && status !== 'All') filter.status = status;

        const partners = await User.find(filter)
            .select('-password -refreshTokens')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);
        res.json({ partners, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching delivery partners', error: error.message });
    }
};

const updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const partner = await User.findOne({ _id: req.params.id, ...req.cityFilter, role: 'delivery' });
        if (!partner) return res.status(404).json({ message: 'Delivery partner not found in your city' });

        partner.status = status;
        await partner.save();
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.json({ message: `Delivery partner status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Error updating delivery partner status', error: error.message });
    }
};

// ========================
// CUSTOMERS
// ========================
const getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        const filter = { ...req.cityFilter, role: 'user' };
        if (status && status !== 'All') filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const customers = await User.find(filter)
            .select('name email phone status createdAt city')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);
        res.json({ customers, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await User.findOne({ _id: req.params.id, ...req.cityFilter, role: 'user' })
            .select('-password -refreshTokens');
        if (!customer) return res.status(404).json({ message: 'Customer not found in your city' });

        const orders = await Order.find({ user: req.params.id, ...req.cityFilter })
            .populate('chef', 'name kitchenName')
            .sort({ createdAt: -1 })
            .limit(20);

        const tickets = await SupportTicket.find({ customer: req.params.id, ...req.cityFilter })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({ customer, orders, tickets });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer', error: error.message });
    }
};

const suspendCustomer = async (req, res) => {
    try {
        const { reason, duration } = req.body; // duration: '24h', '7d', '30d', 'until_review'
        const customer = await User.findOne({ _id: req.params.id, ...req.cityFilter, role: 'user' });
        if (!customer) return res.status(404).json({ message: 'Customer not found in your city' });

        customer.status = 'suspended';
        await customer.save();
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.json({ message: `Customer suspended. Reason: ${reason}. Duration: ${duration}` });
    } catch (error) {
        res.status(500).json({ message: 'Error suspending customer', error: error.message });
    }
};

// ========================
// PROMOTIONS (type: 'promotion')
// ========================
const getPromotions = async (req, res) => {
    try {
        const filter = { ...req.cityFilter, type: 'promotion' };
        const promotions = await Offer.find(filter).sort({ createdAt: -1 });
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching promotions', error: error.message });
    }
};

const createPromotion = async (req, res) => {
    try {
        const offer = new Offer({
            ...req.body,
            type: 'promotion',
            scope: 'City',
            city: req.user.city,
            createdBy: req.user._id
        });
        await offer.save();
        res.status(201).json(offer);
    } catch (error) {
        res.status(400).json({ message: 'Error creating promotion', error: error.message });
    }
};

const updatePromotion = async (req, res) => {
    try {
        const promo = await Offer.findOne({ _id: req.params.id, ...req.cityFilter, type: 'promotion' });
        if (!promo) return res.status(404).json({ message: 'Promotion not found in your city' });

        const allowed = ['title', 'description', 'code', 'discountType', 'discountPercentage', 'discountFlat',
                         'maxDiscountAmount', 'minOrderValue', 'isActive', 'validFrom', 'validUntil',
                         'usageLimit', 'perUserLimit', 'targetChef'];
        allowed.forEach(field => {
            if (req.body[field] !== undefined) promo[field] = req.body[field];
        });
        await promo.save();
        res.json(promo);
    } catch (error) {
        res.status(400).json({ message: 'Error updating promotion', error: error.message });
    }
};

// ========================
// BANNERS
// ========================
const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({
            $or: [
                { targetCity: req.user.city },
                { type: 'Global' }
            ]
        }).sort({ displayOrder: 1, createdAt: -1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching banners', error: error.message });
    }
};

const createBanner = async (req, res) => {
    try {
        const banner = new Banner({
            ...req.body,
            type: 'City',
            targetCity: req.user.city
        });
        await banner.save();
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: 'Error creating banner', error: error.message });
    }
};

const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findOne({ _id: req.params.id, targetCity: req.user.city });
        if (!banner) return res.status(404).json({ message: 'Banner not found in your city' });

        const allowed = ['title', 'imageUrl', 'linkUrl', 'isActive', 'startDate', 'endDate', 'displayOrder'];
        allowed.forEach(field => {
            if (req.body[field] !== undefined) banner[field] = req.body[field];
        });
        await banner.save();
        res.json(banner);
    } catch (error) {
        res.status(400).json({ message: 'Error updating banner', error: error.message });
    }
};

const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findOneAndDelete({ _id: req.params.id, targetCity: req.user.city });
        if (!banner) return res.status(404).json({ message: 'Banner not found in your city' });
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting banner', error: error.message });
    }
};

// ========================
// COUPONS (type: 'coupon')
// ========================
const getCoupons = async (req, res) => {
    try {
        const filter = { ...req.cityFilter, type: 'coupon' };
        const coupons = await Offer.find(filter).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons', error: error.message });
    }
};

const createCoupon = async (req, res) => {
    try {
        const offer = new Offer({
            ...req.body,
            type: 'coupon',
            scope: 'City',
            city: req.user.city,
            createdBy: req.user._id
        });
        await offer.save();
        res.status(201).json(offer);
    } catch (error) {
        res.status(400).json({ message: 'Error creating coupon', error: error.message });
    }
};

const updateCoupon = async (req, res) => {
    try {
        const coupon = await Offer.findOne({ _id: req.params.id, ...req.cityFilter, type: 'coupon' });
        if (!coupon) return res.status(404).json({ message: 'Coupon not found in your city' });

        const allowed = ['title', 'description', 'code', 'discountType', 'discountPercentage', 'discountFlat',
                         'maxDiscountAmount', 'minOrderValue', 'isActive', 'validFrom', 'validUntil',
                         'usageLimit', 'perUserLimit'];
        allowed.forEach(field => {
            if (req.body[field] !== undefined) coupon[field] = req.body[field];
        });
        await coupon.save();
        res.json(coupon);
    } catch (error) {
        res.status(400).json({ message: 'Error updating coupon', error: error.message });
    }
};

// ========================
// SUPPORT TICKETS
// ========================
const getTickets = async (req, res) => {
    try {
        const { status, priority, page = 1, limit = 20 } = req.query;
        const filter = { ...req.cityFilter };
        if (status && status !== 'All') filter.status = status;
        if (priority && priority !== 'All') filter.priority = priority;

        const tickets = await SupportTicket.find(filter)
            .populate('customer', 'name email phone')
            .populate('order', 'totalPrice status')
            .populate('assignedTo', 'name')
            .sort({ priority: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await SupportTicket.countDocuments(filter);

        // Counts by status
        const [urgent, open, inProgress, resolved] = await Promise.all([
            SupportTicket.countDocuments({ ...req.cityFilter, priority: 'urgent', status: { $nin: ['resolved', 'closed'] } }),
            SupportTicket.countDocuments({ ...req.cityFilter, status: 'open' }),
            SupportTicket.countDocuments({ ...req.cityFilter, status: 'in_progress' }),
            SupportTicket.countDocuments({ ...req.cityFilter, status: { $in: ['resolved', 'closed'] } })
        ]);

        res.json({ tickets, total, page: Number(page), pages: Math.ceil(total / limit), counts: { urgent, open, inProgress, resolved } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tickets', error: error.message });
    }
};

const createTicket = async (req, res) => {
    try {
        const ticket = new SupportTicket({
            ...req.body,
            city: req.user.city || req.body.city,
            createdBy: req.user._id,
            assignedTo: req.user._id
        });
        await ticket.save();
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ message: 'Error creating ticket', error: error.message });
    }
};

const updateTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findOne({ _id: req.params.id, ...req.cityFilter });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found in your city' });

        const allowed = ['status', 'priority', 'resolution', 'assignedTo'];
        allowed.forEach(field => {
            if (req.body[field] !== undefined) ticket[field] = req.body[field];
        });
        if (req.body.status === 'resolved' || req.body.status === 'closed') {
            ticket.resolvedAt = new Date();
        }
        await ticket.save();
        res.json(ticket);
    } catch (error) {
        res.status(400).json({ message: 'Error updating ticket', error: error.message });
    }
};

// ========================
// REFUNDS
// ========================
const getRefunds = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { ...req.cityFilter, refundStatus: { $ne: 'None' } };
        if (status && status !== 'All') filter.refundStatus = status;

        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .populate('chef', 'name kitchenName')
            .sort({ updatedAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching refunds', error: error.message });
    }
};

const processRefund = async (req, res) => {
    try {
        const { amount, action } = req.body; // action: 'approve' or 'reject'
        const order = await Order.findOne({ _id: req.params.id, ...req.cityFilter });
        if (!order) return res.status(404).json({ message: 'Order not found in your city' });

        if (action === 'reject') {
            order.refundStatus = 'Rejected';
            await order.save();
            return res.json({ message: 'Refund rejected', order });
        }

        // Get configurable refund threshold
        let refundLimit = 500; // default
        const setting = await GlobalSetting.findOne({ key: 'subadmin_refund_limit' });
        if (setting) refundLimit = Number(setting.value);

        const refundAmount = Number(amount) || order.totalPrice;

        if (refundAmount > refundLimit) {
            order.refundStatus = 'Escalated';
            order.refundAmount = refundAmount;
            await order.save();
            return res.json({ message: `Refund of ₹${refundAmount} exceeds limit ₹${refundLimit}. Escalated to Super Admin.`, refundStatus: 'Escalated' });
        }

        order.refundStatus = 'Approved';
        order.refundAmount = refundAmount;
        await order.save();
        res.json({ message: `Refund of ₹${refundAmount} approved.`, refundStatus: 'Approved', order });
    } catch (error) {
        res.status(500).json({ message: 'Error processing refund', error: error.message });
    }
};

// ========================
// CITY ANALYTICS
// ========================
const getAnalytics = async (req, res) => {
    try {
        const cityFilter = req.cityFilter;
        const now = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

        // Orders analytics
        const [todayOrders, weekOrders, monthOrders] = await Promise.all([
            Order.find({ ...cityFilter, createdAt: { $gte: todayStart } }),
            Order.find({ ...cityFilter, createdAt: { $gte: weekStart } }),
            Order.find({ ...cityFilter, createdAt: { $gte: monthStart } })
        ]);

        const calcStats = (orders) => ({
            count: orders.length,
            revenue: orders.reduce((s, o) => s + (o.totalPrice || 0), 0),
            cancelled: orders.filter(o => o.status === 'Rejected').length
        });

        // Customer analytics
        const [newCustomers, totalCustomers] = await Promise.all([
            User.countDocuments({ ...cityFilter, role: 'user', createdAt: { $gte: monthStart } }),
            User.countDocuments({ ...cityFilter, role: 'user' })
        ]);

        // Chef analytics
        const [activeChefs, topChefs] = await Promise.all([
            User.countDocuments({ ...cityFilter, role: 'chef', status: 'active' }),
            User.find({ ...cityFilter, role: 'chef', status: 'active' }).sort({ rating: -1 }).limit(5).select('name kitchenName rating numReviews')
        ]);

        // Coupon / Promo analytics
        const activePromos = await Offer.countDocuments({ ...cityFilter, isActive: true, validUntil: { $gte: now } });

        res.json({
            orders: {
                today: calcStats(todayOrders),
                week: calcStats(weekOrders),
                month: calcStats(monthOrders)
            },
            customers: { newThisMonth: newCustomers, total: totalCustomers },
            chefs: { active: activeChefs, topPerformers: topChefs },
            promotions: { active: activePromos }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
};

// ========================
// SUB-ADMIN MANAGEMENT (By Regional Admin)
// ========================
const getSubAdmins = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admins can manage Sub-Admins' });
        
        // Find subadmins whose assigned cities are a subset of or intersect with the Admin's assigned cities
        const subadmins = await User.find({ 
            role: 'subadmin',
            assignedCities: { $in: req.user.assignedCities }
        }).populate('assignedCities', 'name');
        
        res.json(subadmins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subadmins', error: error.message });
    }
};

const createSubAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admins can create Sub-Admins' });
        
        const { name, email, phone, password, assignedCities } = req.body;
        
        // Ensure the admin is only assigning cities they themselves manage
        const isValidCities = assignedCities.every(city => req.user.assignedCities.map(c => c.toString()).includes(city));
        if (!isValidCities) {
            return res.status(403).json({ message: 'You can only assign cities that you manage.' });
        }

        // We would normally hash password here if not handled by pre-save hook, assuming pre-save hook handles it.
        const newSubAdmin = new User({
            name, email, phone, password,
            role: 'subadmin',
            assignedCities
        });
        await newSubAdmin.save();
        res.status(201).json(newSubAdmin);
    } catch (error) {
        res.status(400).json({ message: 'Error creating subadmin', error: error.message });
    }
};

const updateSubAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admins can manage Sub-Admins' });
        
        const { assignedCities, status } = req.body;
        
        const subAdmin = await User.findOne({ _id: req.params.id, role: 'subadmin', assignedCities: { $in: req.user.assignedCities } });
        if (!subAdmin) return res.status(404).json({ message: 'Sub-Admin not found in your region' });

        if (assignedCities) {
            const isValidCities = assignedCities.every(city => req.user.assignedCities.map(c => c.toString()).includes(city));
            if (!isValidCities) return res.status(403).json({ message: 'You can only assign cities that you manage.' });
            subAdmin.assignedCities = assignedCities;
        }
        if (status) subAdmin.status = status;
        
        await subAdmin.save();
        res.json(subAdmin);
    } catch (error) {
        res.status(400).json({ message: 'Error updating subadmin', error: error.message });
    }
};

module.exports = {
    getDashboard,
    getOrders, getOrderById, cancelOrder,
    getChefs, updateChefStatus,
    getDeliveryPartners, updateDeliveryStatus,
    getCustomers, getCustomerById, suspendCustomer,
    getPromotions, createPromotion, updatePromotion,
    getBanners, createBanner, updateBanner, deleteBanner,
    getCoupons, createCoupon, updateCoupon,
    getTickets, createTicket, updateTicket,
    getRefunds, processRefund,
    getAnalytics,
    getSubAdmins, createSubAdmin, updateSubAdmin
};
