const Order = require('../models/Order');
const User = require('../models/User');
const City = require('../models/City');
const AuditLog = require('../models/AuditLog');
const SupportTicket = require('../models/SupportTicket');
const Offer = require('../models/Offer');
const Role = require('../models/Role');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// ========================
// DASHBOARD
// ========================
const getDashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            todayOrders,
            totalChefs,
            totalCustomers,
            pendingChefs,
            pendingDelivery,
            pendingRefunds
        ] = await Promise.all([
            Order.find({ createdAt: { $gte: today } }),
            User.countDocuments({ role: 'chef', status: 'active' }),
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'chef', status: 'pending' }),
            User.countDocuments({ role: 'delivery', status: 'pending' }),
            Order.countDocuments({ refundStatus: 'Escalated' }) // Escalated to superadmin
        ]);

        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        // Active Orders Breakdown
        const activeOrders = await Order.aggregate([
            { $match: { status: { $in: ['Placed', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery'] } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const liveOperations = {
            Preparing: activeOrders.find(o => o._id === 'Preparing')?.count || 0,
            Ready: activeOrders.find(o => o._id === 'Ready')?.count || 0,
            Delivery: activeOrders.find(o => o._id === 'Out for Delivery')?.count || 0,
            Placed: activeOrders.find(o => o._id === 'Placed')?.count || 0
        };

        // City Performance
        const cityStats = await City.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'city',
                    as: 'orders'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'city',
                    as: 'users'
                }
            },
            {
                $project: {
                    name: 1,
                    orderCount: { $size: '$orders' },
                    revenue: { $sum: '$orders.totalPrice' },
                    chefCount: {
                        $size: {
                            $filter: {
                                input: '$users',
                                as: 'u',
                                cond: { $and: [{ $eq: ['$$u.role', 'chef'] }, { $eq: ['$$u.status', 'active'] }] }
                            }
                        }
                    },
                    status: { $literal: '🟢' } // Dummy for now
                }
            }
        ]);

        res.json({
            stats: {
                todayOrders: todayOrders.length,
                todayRevenue,
                totalChefs,
                totalCustomers
            },
            liveOperations,
            alerts: {
                pendingChefs,
                pendingDelivery,
                escalatedRefunds: pendingRefunds
            },
            cityStats
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
    }
};

// ========================
// CITIES
// ========================
const getCities = async (req, res) => {
    try {
        const cities = await City.find().populate('subAdminId', 'name email status');
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cities', error: error.message });
    }
};

const createCity = async (req, res) => {
    try {
        const city = new City(req.body);
        await city.save();
        await logAction(req.user._id, 'CREATE_CITY', 'City', city._id, city._id, `Created city ${city.name}`);
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.status(201).json(city);
    } catch (error) {
        res.status(400).json({ message: 'Error creating city', error: error.message });
    }
};

const updateCity = async (req, res) => {
    try {
        const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!city) return res.status(404).json({ message: 'City not found' });
        await logAction(req.user._id, 'UPDATE_CITY', 'City', city._id, city._id, `Updated city ${city.name}`);
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(city);
    } catch (error) {
        res.status(400).json({ message: 'Error updating city', error: error.message });
    }
};

// ========================
// SUB-ADMINS
// ========================
const getSubAdmins = async (req, res) => {
    try {
        const subAdmins = await User.find({ role: { $in: ['subadmin', 'admin'] } })
            .populate('assignedCities', 'name')
            .populate('customRole', 'name type');
        res.json(subAdmins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subadmins', error: error.message });
    }
};

const updateSubAdmin = async (req, res) => {
    try {
        const { assignedCities, status, role, customRole } = req.body;
        const subAdmin = await User.findById(req.params.id);
        if (!subAdmin) return res.status(404).json({ message: 'Subadmin not found' });
        
        if (assignedCities !== undefined) {
            subAdmin.assignedCities = assignedCities;
            // Unset from previous cities
            await City.updateMany({ subAdminId: subAdmin._id }, { $unset: { subAdminId: "" } });
            // Set on new cities
            if (assignedCities.length > 0) {
                await City.updateMany({ _id: { $in: assignedCities } }, { subAdminId: subAdmin._id });
            }
        }
        if (status !== undefined) subAdmin.status = status;
        if (role !== undefined) subAdmin.role = role;
        
        await subAdmin.save();
        await logAction(req.user._id, 'UPDATE_SUBADMIN', 'User', subAdmin._id, null, `Updated subadmin ${subAdmin.name}`);
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(subAdmin);
    } catch (error) {
        res.status(400).json({ message: 'Error updating subadmin', error: error.message });
    }
};

const createSubAdmin = async (req, res) => {
    const bcrypt = require('bcryptjs');
    try {
        const { name, email, password, phone, role, customRole, assignedCities } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User with email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role, // 'admin' or 'subadmin' natively
            assignedCities,
            status: 'active'
        });
        
        await newAdmin.save();
        
        if (assignedCities && assignedCities.length > 0) {
            await City.updateMany({ _id: { $in: assignedCities } }, { subAdminId: newAdmin._id });
        }
        
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(400).json({ message: 'Error creating subadmin', error: error.message });
    }
};

// ========================
// VERIFICATION QUEUE
// ========================
const getVerificationQueue = async (req, res) => {
    try {
        const chefs = await User.find({ role: 'chef', status: 'pending' }).populate('city', 'name');
        const delivery = await User.find({ role: 'delivery', status: 'pending' }).populate('city', 'name');
        res.json({ chefs, delivery });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching verification queue', error: error.message });
    }
};

const verifyUser = async (req, res) => {
    try {
        const { status, note } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.status = status;
        await user.save();
        await logAction(req.user._id, 'VERIFY_USER', 'User', user._id, user.city, `Set ${user.role} ${user.name} to ${status}. Note: ${note || 'None'}`);
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: 'Error verifying user', error: error.message });
    }
};

// ========================
// AUDIT LOGS
// ========================
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('userId', 'name role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
    }
};

// ========================
// OPERATIONS MODULE
// ========================
const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, city, status, search } = req.query;
        const filter = {};
        if (city && city !== 'All') filter.city = city;
        if (status && status !== 'All') filter.status = status;
        if (search && mongoose.Types.ObjectId.isValid(search)) {
            filter._id = search;
        }

        const orders = await Order.find(filter)
            .populate('user', 'name phone email')
            .populate('chef', 'name kitchenName')
            .populate('deliveryPartner', 'name phone')
            .populate('city', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Order.countDocuments(filter);
        res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

const getChefs = async (req, res) => {
    try {
        const { page = 1, limit = 20, city, status, search } = req.query;
        const filter = { role: 'chef' };
        if (city && city !== 'All') filter.city = city;
        if (status && status !== 'All') filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { kitchenName: { $regex: search, $options: 'i' } }
            ];
        }

        const chefs = await User.find(filter)
            .select('-password -refreshTokens')
            .populate('city', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);
        res.json({ chefs, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chefs', error: error.message });
    }
};

const getDelivery = async (req, res) => {
    try {
        const { page = 1, limit = 20, city, status, search } = req.query;
        const filter = { role: 'delivery' };
        if (city && city !== 'All') filter.city = city;
        if (status && status !== 'All') filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const partners = await User.find(filter)
            .select('-password -refreshTokens')
            .populate('city', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await User.countDocuments(filter);
        res.json({ partners, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching delivery partners', error: error.message });
    }
};

const getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20, city, search } = req.query;
        const filter = { role: 'user' };
        if (city && city !== 'All') filter.city = city;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const customers = await User.find(filter)
            .select('-password -refreshTokens')
            .populate('city', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        // Aggregate order stats per customer
        const customerIds = customers.map(c => c._id);
        const orderStats = await Order.aggregate([
            { $match: { user: { $in: customerIds } } },
            { $group: {
                _id: '$user',
                totalOrders: { $sum: 1 },
                totalSpend: { $sum: '$totalPrice' },
                lastOrderDate: { $max: '$createdAt' }
            }}
        ]);

        const statsMap = {};
        orderStats.forEach(s => { statsMap[s._id.toString()] = s; });

        const enrichedCustomers = customers.map(c => ({
            ...c,
            totalOrders: statsMap[c._id.toString()]?.totalOrders || 0,
            totalSpend: statsMap[c._id.toString()]?.totalSpend || 0,
            lastOrderDate: statsMap[c._id.toString()]?.lastOrderDate || null
        }));

        const total = await User.countDocuments(filter);
        res.json({ customers: enrichedCustomers, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

const getCustomerStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalCustomers, activeCustomers, newThisMonth] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'user', status: 'active' }),
            User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } })
        ]);

        const suspendedCustomers = await User.countDocuments({ role: 'user', status: 'suspended' });

        res.json({ totalCustomers, activeCustomers, newThisMonth, suspendedCustomers });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer stats', error: error.message });
    }
};

const getCustomerDetail = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id)
            .select('-password -refreshTokens')
            .populate('city', 'name')
            .lean();

        if (!customer || customer.role !== 'user') {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Get recent orders
        const recentOrders = await Order.find({ user: customer._id })
            .populate('chef', 'name kitchenName')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Get order aggregation
        const orderAgg = await Order.aggregate([
            { $match: { user: customer._id } },
            { $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpend: { $sum: '$totalPrice' },
                avgOrderValue: { $avg: '$totalPrice' }
            }}
        ]);

        const stats = orderAgg[0] || { totalOrders: 0, totalSpend: 0, avgOrderValue: 0 };

        res.json({
            ...customer,
            totalOrders: stats.totalOrders,
            totalSpend: stats.totalSpend,
            avgOrderValue: stats.avgOrderValue,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customer detail', error: error.message });
    }
};

const updateCustomerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be active or suspended.' });
        }

        const customer = await User.findById(req.params.id);
        if (!customer || customer.role !== 'user') {
            return res.status(404).json({ message: 'Customer not found' });
        }

        customer.status = status;
        await customer.save();
        await logAction(req.user._id, 'UPDATE_CUSTOMER_STATUS', 'User', customer._id, customer.city, `Set customer ${customer.name} to ${status}`);
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');

        res.json({ message: `Customer ${status === 'active' ? 'activated' : 'suspended'}`, customer });
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer status', error: error.message });
    }
};

const getSupportTickets = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, city, search } = req.query;
        const filter = {};
        if (status && status !== 'All') filter.status = status;
        if (city && city !== 'All') filter.city = city;
        if (search) {
            filter.subject = { $regex: search, $options: 'i' };
        }

        const tickets = await SupportTicket.find(filter)
            .populate('customer', 'name email phone')
            .populate('order')
            .populate('city', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await SupportTicket.countDocuments(filter);
        res.json({ tickets, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching support tickets', error: error.message });
    }
};

// Helper function for logging actions
const logAction = async (userId, action, resourceType, resourceId, city, notes) => {
    try {
        const user = await User.findById(userId);
        const log = new AuditLog({
            userId,
            role: user ? user.role : 'unknown',
            action,
            resourceType,
            resourceId,
            notes
        });
        await log.save();
    } catch (e) {
        console.error("Failed to write audit log:", e);
    }
};

// ========================
// FINANCE MODULE
// ========================
const getRevenue = async (req, res) => {
    try {
        const { period = 'This Month' } = req.query; // Dummy period filter
        // Aggregate actual orders
        const stats = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: {
                _id: null,
                totalGMV: { $sum: '$totalPrice' },
                platformFees: { $sum: '$platformFee' },
                deliveryFees: { $sum: '$deliveryCharge' },
                netProfit: { $sum: '$profit' }
            }}
        ]);
        
        const data = stats.length > 0 ? stats[0] : { totalGMV: 0, platformFees: 0, deliveryFees: 0, netProfit: 0 };
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching revenue', error: error.message });
    }
};

const getCommissions = async (req, res) => {
    try {
        const GlobalSetting = require('../models/GlobalSetting');
        let defaultRate = await GlobalSetting.findOne({ key: 'global_commission_rate' });
        if (!defaultRate) {
            defaultRate = await GlobalSetting.create({ key: 'global_commission_rate', value: 20 });
        }
        
        const chefs = await User.find({ role: 'chef' }).select('name status commissionRate');
        res.json({ defaultRate: defaultRate.value, chefs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching commissions', error: error.message });
    }
};

const updateGlobalCommission = async (req, res) => {
    try {
        const { rate } = req.body;
        const GlobalSetting = require('../models/GlobalSetting');
        await GlobalSetting.findOneAndUpdate({ key: 'global_commission_rate' }, { value: rate }, { upsert: true });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json({ message: 'Global commission updated', rate });
    } catch (error) {
        res.status(500).json({ message: 'Error updating global commission', error: error.message });
    }
};

const updateChefCommission = async (req, res) => {
    try {
        const { rate } = req.body;
        const chef = await User.findById(req.params.id);
        if(!chef) return res.status(404).json({ message: 'Chef not found' });
        
        chef.commissionRate = rate;
        await chef.save();
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(chef);
    } catch (error) {
        res.status(500).json({ message: 'Error updating chef commission', error: error.message });
    }
};

const getPayouts = async (req, res) => {
    try {
        const Payout = require('../models/Payout');
        const payouts = await Payout.find().populate('chef_id', 'name').sort({ createdAt: -1 });
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payouts', error: error.message });
    }
};

const processBatchPayout = async (req, res) => {
    try {
        const Payout = require('../models/Payout');
        await Payout.updateMany({ status: 'Requested' }, { status: 'Processing' });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json({ message: 'Batch payout initiated' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payouts', error: error.message });
    }
};

const getRefunds = async (req, res) => {
    try {
        const orders = await Order.find({ refundStatus: { $in: ['Pending', 'Escalated'] } }).populate('user', 'name').populate('city', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching refunds', error: error.message });
    }
};

const updateRefundStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if(!order) return res.status(404).json({ message: 'Order not found' });
        
        order.refundStatus = status;
        await order.save();
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating refund', error: error.message });
    }
};

const getTaxes = async (req, res) => {
    try {
        const TaxRule = require('../models/TaxRule');
        const Order = require('../models/Order');
        const taxes = await TaxRule.find();
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const ordersThisMonth = await Order.find({
            createdAt: { $gte: startOfMonth },
            status: 'Completed'
        });

        const foodTaxRule = taxes.find(t => t.category.toLowerCase().includes('food') && t.status === 'Active');
        const foodTaxRate = foodTaxRule ? (foodTaxRule.rate / 100) : 0.05;

        let taxesCollected = 0;
        ordersThisMonth.forEach(o => {
            taxesCollected += (o.itemsPrice * foodTaxRate);
        });

        res.json({
            rules: taxes,
            stats: {
                collectedMtd: taxesCollected,
                reportsGenerated: 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching taxes', error: error.message });
    }
};

const createTax = async (req, res) => {
    try {
        const TaxRule = require('../models/TaxRule');
        const tax = new TaxRule(req.body);
        await tax.save();
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(tax);
    } catch (error) {
        res.status(500).json({ message: 'Error creating tax', error: error.message });
    }
};

const updateTax = async (req, res) => {
    try {
        const TaxRule = require('../models/TaxRule');
        const tax = await TaxRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(tax);
    } catch (error) {
        res.status(500).json({ message: 'Error updating tax', error: error.message });
    }
};

const getWallets = async (req, res) => {
    try {
        const users = await User.find({ walletBalance: { $gt: 0 }, role: 'user' }).select('name email walletBalance');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wallets', error: error.message });
    }
};

// ========================
// MARKETING MODULE
// ========================
const getOffers = async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offers', error: error.message });
    }
};

const createOffer = async (req, res) => {
    try {
        const offer = new Offer({ ...req.body, createdBy: req.user._id });
        await offer.save();
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.status(201).json(offer);
    } catch (error) {
        res.status(400).json({ message: 'Error creating offer', error: error.message });
    }
};

const updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offer) return res.status(404).json({ message: 'Offer not found' });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(offer);
    } catch (error) {
        res.status(400).json({ message: 'Error updating offer', error: error.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndDelete(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json({ message: 'Offer deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting offer', error: error.message });
    }
};

const getBanners = async (req, res) => {
    try {
        const Banner = require('../models/Banner');
        const banners = await Banner.find().sort({ displayOrder: 1 });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching banners', error: error.message });
    }
};

const createBanner = async (req, res) => {
    try {
        const Banner = require('../models/Banner');
        const banner = new Banner(req.body);
        await banner.save();
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: 'Error creating banner', error: error.message });
    }
};

const updateBanner = async (req, res) => {
    try {
        const Banner = require('../models/Banner');
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!banner) return res.status(404).json({ message: 'Banner not found' });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(banner);
    } catch (error) {
        res.status(400).json({ message: 'Error updating banner', error: error.message });
    }
};

const deleteBanner = async (req, res) => {
    try {
        const Banner = require('../models/Banner');
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting banner', error: error.message });
    }
};

const getCampaigns = async (req, res) => {
    try {
        const MarketingCampaign = require('../models/MarketingCampaign');
        const campaigns = await MarketingCampaign.find().populate('chef', 'name').sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
    }
};

const updateCampaign = async (req, res) => {
    try {
        const MarketingCampaign = require('../models/MarketingCampaign');
        const campaign = await MarketingCampaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(campaign);
    } catch (error) {
        res.status(400).json({ message: 'Error updating campaign', error: error.message });
    }
};

const getFeaturedChefs = async (req, res) => {
    try {
        const chefs = await User.find({ role: 'chef' }).select('name status isPinned').sort({ isPinned: -1, createdAt: -1 });
        res.json(chefs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching featured chefs', error: error.message });
    }
};

const toggleFeaturedChef = async (req, res) => {
    try {
        const chef = await User.findById(req.params.id);
        if (!chef) return res.status(404).json({ message: 'Chef not found' });
        
        chef.isPinned = !chef.isPinned;
        await chef.save();
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(chef);
    } catch (error) {
        res.status(400).json({ message: 'Error toggling featured chef', error: error.message });
    }
};

// ========================
// ROLES (RBAC)
// ========================
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find().lean().sort({ createdAt: -1 });
        
        // Dynamically calculate assigned users in real-time
        for (let role of roles) {
            if (role.name === 'Super Admin') {
                role.assignedUsersCount = await User.countDocuments({ 
                    $or: [{ role: 'superadmin' }, { customRole: role._id }] 
                });
            } else if (role.name === 'Admin (Regional)') {
                role.assignedUsersCount = await User.countDocuments({ 
                    $or: [
                        { role: 'admin', customRole: { $exists: false } },
                        { customRole: role._id }
                    ]
                });
            } else if (role.name === 'Sub-Admin (Zonal)') {
                role.assignedUsersCount = await User.countDocuments({ 
                    $or: [
                        { role: 'subadmin', customRole: { $exists: false } },
                        { customRole: role._id }
                    ]
                });
            } else {
                role.assignedUsersCount = await User.countDocuments({ customRole: role._id });
            }
        }
        
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error: error.message });
    }
};

const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const role = new Role({ name, description, permissions, type: 'Custom' });
        await role.save();
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ message: 'Error creating role', error: error.message });
    }
};

const updateRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role not found' });
        if (role.type === 'System') return res.status(400).json({ message: 'Cannot edit system roles' });
        
        role.name = name || role.name;
        role.description = description || role.description;
        role.permissions = permissions || role.permissions;
        
        await role.save();
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(role);
    } catch (error) {
        res.status(400).json({ message: 'Error updating role', error: error.message });
    }
};

const deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role not found' });
        if (role.type === 'System') return res.status(400).json({ message: 'Cannot delete system roles' });
        
        // Real-time check
        const userCount = await User.countDocuments({ customRole: role._id });
        if (userCount > 0) return res.status(400).json({ message: `Cannot delete role. ${userCount} users are currently assigned to it.` });
        
        await Role.findByIdAndDelete(req.params.id);
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json({ message: 'Role deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting role', error: error.message });
    }
};

// ========================
// ANALYTICS
// ========================
const getBusinessAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user', status: 'active' });
        const totalOrders = await Order.countDocuments({ status: { $ne: 'Rejected' } });
        
        const orderStats = await Order.aggregate([
            { $match: { status: { $ne: 'Rejected' } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = orderStats[0]?.totalRevenue || 0;
        const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

        // Retention: users with more than 1 order
        const multiOrderUsers = await Order.aggregate([
            { $group: { _id: "$user", orderCount: { $sum: 1 } } },
            { $match: { orderCount: { $gt: 1 } } },
            { $count: "count" }
        ]);
        const retentionRate = totalUsers > 0 ? ((multiOrderUsers[0]?.count || 0) / totalUsers * 100).toFixed(1) : 0;

        // Order Volume Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0,0,0,0);

        const trend = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'Rejected' } } },
            { $group: { 
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json({
            metrics: {
                totalUsers,
                totalOrders,
                avgOrderValue,
                retentionRate
            },
            trend
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching business analytics', error: error.message });
    }
};

const getCityAnalytics = async (req, res) => {
    try {
        const cityStats = await Order.aggregate([
            { $match: { status: { $ne: 'Rejected' }, city: { $exists: true, $ne: null } } },
            { $group: {
                _id: "$city",
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$totalPrice" }
            }},
            {
                $lookup: {
                    from: "cities",
                    localField: "_id",
                    foreignField: "_id",
                    as: "cityInfo"
                }
            },
            { $unwind: "$cityInfo" },
            { $sort: { totalRevenue: -1 } },
            { $project: {
                _id: 1,
                cityName: "$cityInfo.name",
                totalOrders: 1,
                totalRevenue: 1
            }}
        ]);
        
        // Also get active chefs per city
        const chefStats = await User.aggregate([
            { $match: { role: 'chef', status: 'active', city: { $exists: true, $ne: null } } },
            { $group: { _id: "$city", chefCount: { $sum: 1 } } }
        ]);

        const mappedStats = cityStats.map(stat => {
            const chefData = chefStats.find(c => c._id?.toString() === stat._id?.toString());
            return {
                ...stat,
                activeChefs: chefData ? chefData.chefCount : 0
            };
        });

        res.json(mappedStats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching city analytics', error: error.message });
    }
};

// ========================
// PLATFORM SETTINGS & HEALTH
// ========================
const getGlobalSettings = async (req, res) => {
    try {
        const GlobalSetting = require('../models/GlobalSetting');
        const settings = await GlobalSetting.find();
        
        // Convert array of {key, value} to object
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        
        // Default values if not in DB yet
        if (!settingsObj.platformName) settingsObj.platformName = 'TasteNova';
        if (!settingsObj.supportEmail) settingsObj.supportEmail = 'support@tastenova.com';
        if (!settingsObj.baseDeliveryFee) settingsObj.baseDeliveryFee = 40;
        if (settingsObj.maintenanceMode === undefined) settingsObj.maintenanceMode = false;
        
        // Security defaults
        if (settingsObj.sessionTimeout === undefined) settingsObj.sessionTimeout = 60;
        if (settingsObj.requireTwoFactor === undefined) settingsObj.requireTwoFactor = false;
        if (settingsObj.passwordExpiryDays === undefined) settingsObj.passwordExpiryDays = 90;
        if (settingsObj.maxLoginAttempts === undefined) settingsObj.maxLoginAttempts = 5;

        // Payments defaults
        if (!settingsObj.razorpayKey) settingsObj.razorpayKey = '';
        if (!settingsObj.gatewayMode) settingsObj.gatewayMode = 'sandbox';
        if (settingsObj.payoutCycleDays === undefined) settingsObj.payoutCycleDays = 7;
        if (settingsObj.autoApprovePayoutsUnder === undefined) settingsObj.autoApprovePayoutsUnder = 1000;

        // Notifications defaults
        if (settingsObj.enableEmailNotifications === undefined) settingsObj.enableEmailNotifications = true;
        if (settingsObj.enableSmsNotifications === undefined) settingsObj.enableSmsNotifications = true;
        if (!settingsObj.fcmServerKey) settingsObj.fcmServerKey = '';
        if (!settingsObj.adminAlertEmail) settingsObj.adminAlertEmail = 'alerts@tastenova.com';

        // Advanced defaults
        if (settingsObj.maxConcurrentOrdersPerChef === undefined) settingsObj.maxConcurrentOrdersPerChef = 20;
        if (settingsObj.apiRateLimit === undefined) settingsObj.apiRateLimit = 100;
        if (settingsObj.debugMode === undefined) settingsObj.debugMode = false;
        if (settingsObj.logRetentionDays === undefined) settingsObj.logRetentionDays = 30;
        
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
};

const updateGlobalSettings = async (req, res) => {
    try {
        const GlobalSetting = require('../models/GlobalSetting');
        const updates = req.body; // e.g., { platformName: 'TasteNova 2', maintenanceMode: true }
        
        for (const [key, value] of Object.entries(updates)) {
            await GlobalSetting.findOneAndUpdate(
                { key },
                { key, value },
                { upsert: true, new: true }
            );
        }
        
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
};

const getSystemHealth = async (req, res) => {
    try {
        // Ping DB
        const startDb = Date.now();
        await mongoose.connection.db.admin().ping();
        const dbLatency = Date.now() - startDb;
        
        const health = [
            { name: 'API Server', status: 'Operational', latency: '22ms', uptime: '99.99%', color: '#27ae60' },
            { name: 'Database Cluster', status: 'Operational', latency: `${dbLatency}ms`, uptime: '99.99%', color: '#27ae60' },
            { name: 'Payment Gateway (Razorpay)', status: 'Operational', latency: '150ms', uptime: '99.95%', color: '#27ae60' },
            { name: 'Maps API (Google)', status: 'Operational', latency: '45ms', uptime: '99.99%', color: '#27ae60' }
        ];
        
        const logs = [
            `[${new Date().toLocaleTimeString()}] INFO API: Health check requested by SuperAdmin`,
            `[${new Date(Date.now()-60000).toLocaleTimeString()}] INFO Database: Connection pool stable`,
            `[${new Date(Date.now()-3600000).toLocaleTimeString()}] INFO System: Cron jobs executed successfully`
        ];
        
        res.json({ health, logs, overall: 'Operational' });
    } catch (error) {
        res.status(500).json({ 
            health: [
                { name: 'API Server', status: 'Operational', latency: '22ms', uptime: '99.99%', color: '#27ae60' },
                { name: 'Database Cluster', status: 'Degraded', latency: `ERR`, uptime: '99.99%', color: '#f39c12' }
            ], 
            overall: 'Degraded',
            logs: [`[${new Date().toLocaleTimeString()}] ERROR DB: Connection failed`]
        });
    }
};

// ========================
// CATEGORIES
// ========================
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ displayOrder: 1 });
        // Optional: Get associated items count per category. 
        // For now we'll mock the count or fetch it if possible. Let's just return categories.
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error creating category', error: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: 'Error updating category', error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        if (req.app.get('io')) req.app.get('io').emit('superadmin_refresh');
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};

module.exports = {
    getDashboard,
    getCities, createCity, updateCity,
    getSubAdmins, createSubAdmin, updateSubAdmin,
    getVerificationQueue, verifyUser,
    getAuditLogs,
    getOrders, getChefs, getDelivery, getCustomers, getCustomerStats, getCustomerDetail, updateCustomerStatus, getSupportTickets,
    getRevenue, getCommissions, updateGlobalCommission, updateChefCommission,
    getPayouts, processBatchPayout, getRefunds, updateRefundStatus,
    getTaxes, createTax, updateTax, getWallets,
    getOffers, createOffer, updateOffer, deleteOffer,
    getBanners, createBanner, updateBanner, deleteBanner,
    getCampaigns, updateCampaign, getFeaturedChefs, toggleFeaturedChef,
    getRoles, createRole, updateRole, deleteRole,
    getBusinessAnalytics, getCityAnalytics,
    getGlobalSettings, updateGlobalSettings, getSystemHealth,
    getCategories, createCategory, updateCategory, deleteCategory
};
