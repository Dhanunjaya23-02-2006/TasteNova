const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who performed the action
    role: { type: String, required: true },
    action: { type: String, required: true }, // e.g., 'APPROVED_REFUND', 'SUSPENDED_CHEF'
    resourceType: { type: String, required: true }, // e.g., 'Order', 'User'
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the affected resource
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
