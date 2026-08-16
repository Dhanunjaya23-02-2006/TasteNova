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

        res.json({ message: `Order status updated to ${status}` });
    } catch (error) {
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
