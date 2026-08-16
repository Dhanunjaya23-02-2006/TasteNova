const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['System', 'Custom'],
        default: 'Custom'
    },
    permissions: [{
        type: String,
        enum: [
            'manage_users',
            'manage_chefs',
            'manage_orders',
            'manage_support',
            'manage_finance',
            'manage_marketing',
            'manage_roles',
            'manage_cities',
            'manage_settings'
        ]
    }],
    assignedUsersCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
