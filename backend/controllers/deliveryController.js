const Order = require('../models/Order');
const User = require('../models/User');

// Get Dashboard Stats for Delivery Partner
exports.getDashboardStats = async (req, res) => {
    try {
        const deliveryPartnerId = req.user._id;

        // Fetch user to get status
        const partner = await User.findById(deliveryPartnerId);
        
        if (!partner) {
            return res.status(404).json({ message: 'Delivery partner not found' });
        }

        // Today's boundaries
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch all orders assigned to this partner today
        const todaysOrders = await Order.find({
            deliveryPartner: deliveryPartnerId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            deliveryStatus: 'Delivered'
        });

        const todaysDeliveries = todaysOrders.length;
        const todaysEarnings = todaysOrders.reduce((acc, order) => acc + (order.deliveryCharge || 0), 0);

        // Active delivery (not delivered, but assigned to this partner)
        const activeDelivery = await Order.findOne({
            deliveryPartner: deliveryPartnerId,
            deliveryStatus: { $in: ['Assigned', 'Arrived At Chef', 'Picked Up', 'Arrived At Customer'] }
        }).populate('chef', 'name addresses phone').populate('user', 'name addresses phone');

        res.json({
            status: partner.status,
            isOnline: partner.isOnline,
            stats: {
                earnings: { value: todaysEarnings, trend: '+0%', label: 'vs yesterday' },
                deliveries: { value: todaysDeliveries, trend: '+0', label: 'vs yesterday' },
                distance: { value: '0 km', trend: '+0 km', label: 'vs yesterday' },
                rating: { value: partner.rating || 5.0, sub: `Based on ${partner.numReviews || 0} ratings` },
                acceptance: { value: '100%', trend: '+0%', label: 'vs last 7 days' }
            },
            activeDelivery: activeDelivery ? formatOrderForFrontend(activeDelivery) : null
        });
    } catch (error) {
        console.error('getDashboardStats Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Toggle Online/Offline Status
exports.toggleOnlineStatus = async (req, res) => {
    try {
        const partner = await User.findById(req.user._id);
        partner.isOnline = !partner.isOnline;
        await partner.save();
        res.json({ isOnline: partner.isOnline, message: partner.isOnline ? 'You are now online' : 'You are now offline' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Orders (New Requests, Active, History)
exports.getOrders = async (req, res) => {
    try {
        const { tab } = req.query; // 'new', 'active', 'history'
        const partnerId = req.user._id;

        let orders = [];

        if (tab === 'new') {
            // Find orders in 'Pending' deliveryStatus
            orders = await Order.find({
                deliveryStatus: 'Pending',
                status: { $in: ['Placed', 'Accepted', 'Preparing', 'Ready'] } 
            }).populate('chef', 'name addresses businessName phone').populate('user', 'name addresses phone').limit(10);
            
            // Format for frontend
            orders = orders.map(formatNewRequest);
        } else if (tab === 'active') {
            const activeOrder = await Order.findOne({
                deliveryPartner: partnerId,
                deliveryStatus: { $in: ['Assigned', 'Arrived At Chef', 'Picked Up', 'Arrived At Customer'] }
            }).populate('chef', 'name addresses phone businessName').populate('user', 'name addresses phone');
            
            orders = activeOrder ? formatOrderForFrontend(activeOrder) : null;
        } else if (tab === 'history') {
            const historyOrders = await Order.find({
                deliveryPartner: partnerId,
                deliveryStatus: 'Delivered'
            }).populate('chef', 'name').populate('user', 'name addresses').sort({ createdAt: -1 }).limit(20);
            
            orders = historyOrders.map(formatHistoryOrder);
        }

        res.json(orders);
    } catch (error) {
        console.error('getOrders Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Accept an Order
exports.acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // Ensure no other active delivery
        const activeOrder = await Order.findOne({
            deliveryPartner: req.user._id,
            deliveryStatus: { $in: ['Assigned', 'Arrived At Chef', 'Picked Up', 'Arrived At Customer'] }
        });

        if (activeOrder) {
            return res.status(400).json({ message: 'You already have an active delivery' });
        }

        const order = await Order.findById(orderId);
        if (!order || order.deliveryStatus !== 'Pending') {
            return res.status(400).json({ message: 'Order is no longer available' });
        }

        order.deliveryPartner = req.user._id;
        order.deliveryStatus = 'Assigned';
        order.status = 'Out for Delivery';
        await order.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('order_status_update', order);
            io.emit('admin_refresh');
            if (order.user) io.to('user_' + order.user).emit('delivery_status_update', order);
            if (order.chef) io.to('chef_' + order.chef).emit('delivery_status_update', order);
        }

        res.json({ message: 'Order accepted successfully', orderId: order._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, otp } = req.body;
        
        const order = await Order.findOne({ _id: orderId, deliveryPartner: req.user._id }).populate('user', 'phone');
        if (!order) {
            return res.status(404).json({ message: 'Order not found or not assigned to you' });
        }

        // Validate OTP if status is 'Delivered'
        if (status === 'Delivered') {
            const customerPhone = order.user.phone || '1234567890';
            const expectedOtp = customerPhone.slice(-4);
            // Also accept 1234 as universal OTP for testing
            if (otp !== expectedOtp && otp !== '1234') {
                return res.status(400).json({ message: 'Invalid OTP' });
            }
            order.status = 'Completed';
            order.deliveredAt = new Date();
        }

        order.deliveryStatus = status;
        await order.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('order_status_update', order);
            io.emit('admin_refresh');
            if (order.user && order.user._id) io.to('user_' + order.user._id).emit('delivery_status_update', order);
            else if (order.user) io.to('user_' + order.user).emit('delivery_status_update', order);
            
            if (order.chef) io.to('chef_' + order.chef).emit('delivery_status_update', order);
        }

        res.json({ message: `Order status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Earnings for Delivery Partner
exports.getEarnings = async (req, res) => {
    try {
        const partnerId = req.user._id;
        const user = await User.findById(partnerId);

        const allOrders = await Order.find({
            deliveryPartner: partnerId,
            deliveryStatus: 'Delivered'
        }).sort({ deliveredAt: -1, createdAt: -1 });

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const summaries = {
            today: { total: 0, delivery: 0, distance: 0, peak: 0, other: 0, trips: 0, onlineHours: user.todayOnlineHours || 0 },
            week: { total: 0, delivery: 0, distance: 0, peak: 0, other: 0, trips: 0 },
            month: { total: 0, delivery: 0, distance: 0, peak: 0, other: 0, trips: 0 }
        };

        const transactions = [];

        allOrders.forEach(order => {
            const date = new Date(order.deliveredAt || order.createdAt);
            const amount = order.deliveryCharge || 50;

            if (date >= startOfToday) {
                summaries.today.total += amount;
                summaries.today.delivery += amount;
                summaries.today.trips += 1;
            }
            if (date >= startOfWeek) {
                summaries.week.total += amount;
                summaries.week.delivery += amount;
                summaries.week.trips += 1;
            }
            if (date >= startOfMonth) {
                summaries.month.total += amount;
                summaries.month.delivery += amount;
                summaries.month.trips += 1;
            }

            if (transactions.length < 20) {
                transactions.push({
                    id: `#${order._id.toString().slice(-6).toUpperCase()}`,
                    type: 'Delivery',
                    amount: amount,
                    time: date.toLocaleString()
                });
            }
        });

        res.json({ summaries, transactions });
    } catch (error) {
        console.error('getEarnings Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Ping Online Status (Heartbeat)
exports.pingOnlineStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Only increment if the user is currently online
        if (user.isOnline) {
            // Increment by 1 minute (1/60 hours)
            user.todayOnlineHours = (user.todayOnlineHours || 0) + (1 / 60);
            await user.save();
        }
        
        res.json({ todayOnlineHours: user.todayOnlineHours });
    } catch (error) {
        console.error('Error in pingOnlineStatus:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Incentives and Bonus Progress
exports.getIncentives = async (req, res) => {
    try {
        const partnerId = req.user._id;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const todayDeliveries = await Order.countDocuments({
            deliveryPartner: partnerId,
            deliveryStatus: 'Delivered',
            deliveredAt: { $gte: startOfToday }
        });

        const totalLifetimeDeliveries = await Order.countDocuments({
            deliveryPartner: partnerId,
            deliveryStatus: 'Delivered'
        });

        if (totalLifetimeDeliveries === 0) {
            return res.json({
                dailyChallenge: null,
                activeOffers: []
            });
        }

        // Current target is 10 deliveries for ₹150 bonus
        const dailyTarget = 10;
        const dailyBonus = 150;

        res.json({
            dailyChallenge: {
                target: dailyTarget,
                completed: todayDeliveries,
                bonusAmount: dailyBonus
            },
            activeOffers: [
                {
                    id: 1,
                    title: 'Peak Hours Bonus',
                    status: 'Active',
                    description: 'Earn ₹20 extra on every delivery between 7:00 PM and 10:00 PM today.',
                    progress: { current: Math.min(todayDeliveries, 5), max: 5, label: 'Peak Deliveries' },
                    color: 'var(--primary)',
                    iconType: 'trending'
                },
                {
                    id: 2,
                    title: 'Weekly Target',
                    status: 'Ongoing',
                    description: 'Complete 50 deliveries this week to unlock ₹500 bonus.',
                    progress: { current: todayDeliveries * 3, max: 50, label: 'Weekly Deliveries' }, // Dummy logic for weekly multiplier
                    color: '#f39c12',
                    iconType: 'check'
                }
            ]
        });
    } catch (error) {
        console.error('getIncentives Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Helper Functions ---
function formatOrderForFrontend(order) {
    const chefAddr = order.chef?.addresses?.[0]?.streetAddress || 'Chef Location';
    const userAddr = order.user?.addresses?.[0]?.streetAddress || order.shippingAddress?.address || 'Customer Location';
    
    // Map backend states to frontend expected states
    const stateMap = {
        'Assigned': 'assigned',
        'Arrived At Chef': 'arrived_chef',
        'Picked Up': 'picked_up',
        'Arrived At Customer': 'arrived_customer',
        'Delivered': 'delivered'
    };

    return {
        _id: order._id,
        id: `#${order._id.toString().slice(-6).toUpperCase()}`,
        status: order.deliveryStatus,
        frontendState: stateMap[order.deliveryStatus] || 'assigned',
        chef: { 
            name: order.chef?.businessName || order.chef?.name || 'Chef', 
            address: chefAddr,
            phone: order.chef?.phone || '+910000000000',
            lat: order.chef?.kitchenLocation?.coordinates?.[1] || 17.4399,
            lng: order.chef?.kitchenLocation?.coordinates?.[0] || 78.4983
        },
        pickup: { 
            name: order.chef?.businessName || order.chef?.name || 'Chef', 
            location: chefAddr,
            lat: order.chef?.kitchenLocation?.coordinates?.[1] || 17.4399,
            lng: order.chef?.kitchenLocation?.coordinates?.[0] || 78.4983
        },
        customer: { 
            name: order.user?.name || 'Customer', 
            address: userAddr,
            phone: order.user?.phone || '+910000000000',
            lat: order.shippingAddress?.lat || 17.4399,
            lng: order.shippingAddress?.lng || 78.4983
        },
        drop: { 
            name: order.user?.name || 'Customer', 
            location: userAddr,
            lat: order.shippingAddress?.lat || 17.4399,
            lng: order.shippingAddress?.lng || 78.4983
        },
        time: '25 mins',
        distance: `${order.shippingAddress?.distanceKm || 3} km`,
        earnings: order.deliveryCharge || 50,
        items: order.orderItems?.length || 1,
        amount: order.totalPrice || 0,
        payment: order.isPaid ? 'PAID ONLINE' : 'CASH ON DELIVERY'
    };
}

function formatNewRequest(order) {
    const chefAddr = order.chef?.addresses?.[0]?.streetAddress || 'Chef Location';
    const userAddr = order.user?.addresses?.[0]?.streetAddress || order.shippingAddress?.address || 'Customer Location';
    
    return {
        _id: order._id,
        id: `#${order._id.toString().slice(-6).toUpperCase()}`,
        chef: order.chef?.businessName || order.chef?.name || 'Chef',
        pickupLoc: chefAddr,
        dropLoc: userAddr,
        dist: `${order.shippingAddress?.distanceKm || 3} km`,
        est: order.deliveryCharge || 50,
        time: '20 mins',
        expiry: 59
    };
}

function formatHistoryOrder(order) {
    const userAddr = order.user?.addresses?.[0]?.streetAddress || order.shippingAddress?.address || 'Customer Location';
    
    return {
        _id: order._id,
        id: `#${order._id.toString().slice(-6).toUpperCase()}`,
        customer: order.user?.name || 'Customer',
        drop: userAddr,
        earnings: order.deliveryCharge || 50,
        status: order.deliveryStatus,
        time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
}
