const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        ingredientCost: { type: Number, required: true }
    }],
    shippingAddress: {
        address: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number },
        distanceKm: { type: Number }
    },
    paymentMethod: { type: String, required: true, default: 'Razorpay' },
    paymentResult: {
        id: { type: String },
        status: { type: String }, // Pending, Paid, Failed
        update_time: { type: String }
    },
    itemsPrice: { type: Number, required: true, default: 0.0 }, // Total cost of food
    ingredientTotalCost: { type: Number, required: true, default: 0.0 }, // Total ingredient cost
    platformFee: { type: Number, required: true, default: 0.0 },
    deliveryCharge: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    profit: { type: Number, default: 0.0 }, // Profit = (Food Total + Platform Fee + Delivery Charge) − Ingredient Cost − Delivery Partner Payout

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    status: {
        type: String,
        enum: ['Placed', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Rejected'],
        default: 'Placed'
    },
    deliveryStatus: {
        type: String,
        enum: ['Pending', 'Assigned', 'Picked Up', 'Delivered'],
        default: 'Pending'
    },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveryPartnerPayout: { type: Number, default: 0.0 },
    payoutStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chefPayout: { type: Number, default: 0.0 },
    chefPayoutStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },

    // New Fields for Scheduling & Subscriptions
    orderType: { 
        type: String, 
        enum: ['Instant', 'Scheduled', 'Subscription'], 
        default: 'Instant' 
    },
    scheduledTime: { type: String }, // e.g., "1:30 PM", "7:00 PM"
    scheduledDate: { type: Date }, // Optional: specific date for the schedule
    userSubscription: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSubscription' },

    // Sub-admin Scope & Refunds
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    refundStatus: { type: String, enum: ['None', 'Pending', 'Approved', 'Processing', 'Completed', 'Rejected', 'Escalated'], default: 'None' },
    refundAmount: {
        type: Number,
        default: 0
    },
    escrow_status: {
        type: String,
        enum: ['pending', 'settled', 'none'],
        default: 'none'
    },
    deliveredAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    }

}, { timestamps: true });

// Compound Indexes for fast querying
orderSchema.index({ user: 1, createdAt: -1 }); // Fast user order history
orderSchema.index({ chef: 1, status: 1, createdAt: -1 }); // Fast chef active orders
orderSchema.index({ deliveryPartner: 1, deliveryStatus: 1 }); // Fast delivery partner active orders
orderSchema.index({ city: 1, createdAt: -1 }); // Fast admin city-level queries

module.exports = mongoose.model('Order', orderSchema);
