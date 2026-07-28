const ChefBooking = require('../models/ChefBooking');
const Order = require('../models/Order');
const User = require('../models/User');

// ========================
// Delivery Partner Management
// ========================
// Replaced by User Role "delivery"
const getDeliveryPartners = async (req, res) => {
    const partners = await User.find({ role: 'delivery' });
    res.json(partners);
};

// ========================
// Chef Bookings
// ========================
const createChefBooking = async (req, res) => {
    try {
        const booking = new ChefBooking({ ...req.body, user: req.user._id });
        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const getChefBookings = async (req, res) => {
    const bookings = await ChefBooking.find({}).populate('user', 'name phone');
    res.json(bookings);
};

const updateChefBookingStatus = async (req, res) => {
    try {
        const booking = await ChefBooking.findById(req.params.id);
        if (booking) {
            booking.status = req.body.status || booking.status;
            booking.price = req.body.price || booking.price;
            await booking.save();
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating booking' });
    }
};

// ========================
// Profit & Analytics
// ========================
const getAnalytics = async (req, res) => {
    try {
        const orders = await Order.find({ isPaid: true });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const analytics = {
            today: { orders: 0, revenue: 0, expenses: 0, profit: 0 },
            previous: { orders: 0, revenue: 0, expenses: 0, profit: 0 },
            total: { orders: 0, revenue: 0, expenses: 0, profit: 0 }
        };

        orders.forEach(order => {
            const orderDate = new Date(order.paidAt || order.createdAt);
            const isToday = orderDate >= today;
            const target = isToday ? analytics.today : analytics.previous;

            const revenue = order.totalPrice;
            const expense = order.ingredientTotalCost + order.deliveryCharge + order.deliveryPartnerPayout;
            // Assuming simplified profit = total price - (ingredient + delivery + partner payout costs etc.)
            // Or use predefined profit if saved in db
            const profit = order.profit || (revenue - expense);

            target.orders += 1;
            target.revenue += revenue;
            target.expenses += expense;
            target.profit += profit;

            analytics.total.orders += 1;
            analytics.total.revenue += revenue;
            analytics.total.expenses += expense;
            analytics.total.profit += profit;
        });

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating analytics' });
    }
};

module.exports = {
    getDeliveryPartners,
    createChefBooking,
    getChefBookings,
    updateChefBookingStatus,
    getAnalytics
};
