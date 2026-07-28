const AuditLog = require('../models/AuditLog');

const logAction = async (userId, role, action, resourceType, resourceId, oldValue = null, newValue = null, req = null) => {
    try {
        await AuditLog.create({
            userId,
            role,
            action,
            resourceType,
            resourceId,
            oldValue,
            newValue,
            ipAddress: req ? req.ip : null
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

module.exports = { logAction };
