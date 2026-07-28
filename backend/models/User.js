const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'subadmin', 'delivery', 'chef', 'superadmin'], default: 'user' },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'active' },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // FK to City table for scoping subadmins, chefs, deliveries, users
    businessName: { type: String }, // For Chefs/Kitchens
    description: { type: String }, // For Chefs/Kitchens
    kitchenImage: { type: String }, // For Chefs/Kitchens
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    addresses: [{
        streetAddress: { type: String, required: true },
        label: { type: String, default: 'Home' }, // e.g. Home, Work, Other
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }
    }],
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    phoneOtp: { type: String },
    resetPasswordOtp: { type: String },
    otpExpires: { type: Date },
    // Verification Flags for Chefs
    isIdVerified: { type: Boolean, default: false },
    isFssaiVerified: { type: Boolean, default: false },
    isKitchenVerified: { type: Boolean, default: false },
    fssaiNumber: { type: String },
    isPinned: { type: Boolean, default: false }, // Manually featured by SuperAdmin
    
    // Kitchen Location for Geospatial Queries
    kitchenLocation: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] } // [longitude, latitude]
    },
    deliveryRadius: { type: Number, default: 6, min: 2, max: 10 }, // Chef's delivery radius in km

    // Finance / Payouts
    walletBalance: { type: Number, default: 0 }, // For Customers
    commissionRate: { type: Number }, // Specific Chef Commission Override (optional)
    
    // For Chefs: Operating Hours and Cutoffs
    operatingHours: {
        lunch: {
            start: { type: String, default: "12:00" }, // e.g. "12:00" (24hr format)
            end: { type: String, default: "14:00" },
            cutoff: { type: String, default: "10:30" }, // Orders for lunch close at 10:30 AM
            active: { type: Boolean, default: true }
        },
        dinner: {
            start: { type: String, default: "19:00" },
            end: { type: String, default: "21:00" },
            cutoff: { type: String, default: "17:30" }, // Orders for dinner close at 5:30 PM
            active: { type: Boolean, default: true }
        }
    },
    
    // Auth / Security
    refreshTokens: [{ type: String }],
    
    // Social / Following
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Add Geospatial Index
userSchema.index({ kitchenLocation: '2dsphere' });

// Add Compound Index for filtering users
userSchema.index({ role: 1, city: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
