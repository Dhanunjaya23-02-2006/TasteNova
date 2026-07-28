const crypto = require('crypto');
const Order = require('../models/Order');
const ChefBooking = require('../models/ChefBooking');

// @desc    Handle Razorpay Webhooks
// @route   POST /api/webhooks/razorpay
// @access  Public
const handleRazorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret_here';
    
    // Verify signature
    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature !== expectedSignature) {
        console.error('Invalid Razorpay Signature');
        return res.status(400).send('Invalid Signature');
    }

    const event = req.body.event;
    console.log(`Razorpay Webhook Event: ${event}`);

    try {
        if (event === 'payment.captured') {
            const paymentId = req.body.payload.payment.entity.id;
            const orderId = req.body.payload.payment.entity.order_id;
            const amount = req.body.payload.payment.entity.amount / 100; // in INR

            // 1. Check if it's a food order
            let order = await Order.findOne({ 'paymentResult.id': orderId });
            
            if (order) {
                if (!order.isPaid) {
                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.paymentResult.status = 'Paid';
                    order.status = 'Placed'; // Or 'Accepted' based on flow
                    await order.save();
                    console.log(`Order ${order._id} marked as Paid via Webhook`);
                }
            } else {
                // 2. Check if it's a chef booking
                // Note: ChefBooking might store razorpay order ID differently or not at all depending on current implementation
                // Looking at Home.jsx, it doesn't seem to store the razorpay order_id in ChefBooking yet.
                // It only stores paymentId after success.
                // We'll need to improve ChefBooking model if we want webhook support for it too.
            }
        }

        res.status(200).send('Webhook Received');
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { handleRazorpayWebhook };
