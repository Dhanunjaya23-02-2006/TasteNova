const cron = require('node-cron');
const Order = require('../models/Order');

// Schedule job to run every minute
const startOrderAutoCancelJob = (io) => {
    cron.schedule('* * * * *', async () => {
        try {
            // Find instant orders that are placed and expired
            const expiredTime = new Date(Date.now() - 90000); // 90 seconds ago

            const expiredOrders = await Order.find({
                status: 'Placed',
                $or: [{ orderType: 'Instant' }, { orderType: { $exists: false } }],
                paidAt: { $lte: expiredTime }
            });

            for (let order of expiredOrders) {
                order.status = 'Rejected';
                order.refundStatus = 'Pending';
                order.refundAmount = order.totalPrice;
                await order.save();

                // Notify Chef it expired
                if (io) {
                    io.to('chef_' + order.chef).emit('order_expired', order._id);
                    io.to(order._id.toString()).emit('receive_message', { system: true, message: 'Order was automatically cancelled as the chef is currently unavailable.' });
                }
            }
        } catch (error) {
            console.error('[CRON] Error in auto-cancel job:', error);
        }
    });
};

module.exports = startOrderAutoCancelJob;
