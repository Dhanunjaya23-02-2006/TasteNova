const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    ticketNumber: { type: String, unique: true }, // Auto-generated: TN-XXXX
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    category: {
        type: String,
        enum: [
            // Customer issues
            'food_quality', 'late_delivery', 'wrong_item', 'missing_item', 'delivery_issue', 'refund_request',
            // Chef issues
            'order_issue', 'payment_payout_issue', 'customer_issue', 'menu_issue', 'kitchen_account_issue', 'technical_issue', 'other'
        ],
        required: true
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'waiting_for_customer', 'waiting_for_chef', 'resolved', 'closed'],
        default: 'open'
    },
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        attachments: [{ type: String }],
        createdAt: { type: Date, default: Date.now }
    }],
    resolution: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resolvedAt: { type: Date }
}, { timestamps: true });

// Auto-generate ticket number before save
supportTicketSchema.pre('save', async function(next) {
    if (this.isNew && !this.ticketNumber) {
        const count = await mongoose.model('SupportTicket').countDocuments();
        this.ticketNumber = `TN-${String(count + 1001).padStart(6, '0')}`;
    }
    next();
});

// Indexes for fast sub-admin queries
supportTicketSchema.index({ city: 1, status: 1, priority: 1 });
supportTicketSchema.index({ customer: 1, createdAt: -1 });
supportTicketSchema.index({ order: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
