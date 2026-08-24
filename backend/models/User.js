const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'subadmin', 'delivery', 'chef', 'superadmin'], default: 'user' },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'active' },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, // Primary single city (Customers, Chefs, Delivery)
    assignedCities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'City' }], // Array of cities for Admin Role
    assignedZones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Zone' }], // Array of zones for Subadmin Role
    customRole: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }, // For custom RBAC roles
    businessName: { type: String }, // For Chefs/Kitchens
    description: { type: String }, // For Chefs/Kitchens
    vehicleType: { type: String }, // For Delivery Partners
    vehicleNumber: { type: String }, // For Delivery Partners (e.g., TS09 AB 1234)
    isOnline: { type: Boolean, default: false }, // For Delivery Partners / Chefs
    todayOnlineHours: { type: Number, default: 0 }, // For Delivery Partners
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    }, // Real-time tracking for Delivery Partners
    kitchenImage: { type: String }, // For Chefs/Kitchens
    profilePic: { type: String }, // General Profile Picture (Customers/Chefs)
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    addresses: [{
        label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
        receiverName: { type: String, trim: true },
        phone: { type: String },
        houseFlat: { type: String },
        floor: { type: String },
        building: { type: String },
        street: { type: String },
        area: { type: String },
        landmark: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        formattedAddress: { type: String },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number] } // [longitude, latitude]
        },
        deliveryInstructions: { type: String },
        isDefault: { type: Boolean, default: false }
    }],
    paymentMethods: [{
        cardNumber: { type: String, required: true }, // Should store masked or token in prod
        cardName: { type: String, required: true },
        expiryDate: { type: String, required: true },
        cardType: { type: String, default: 'VISA' },
        isDefault: { type: Boolean, default: false }
    }],
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    phoneOtp: { type: String },
    resetPasswordOtp: { type: String },
    otpExpires: { type: Date },
    documents: {
        idProof: { type: String },
        fssaiCertificate: { type: String },
        drivingLicence: { type: String },
        vehicleRc: { type: String },
        vehicleInsurance: { type: String }
    },
    bankDetails: {
        accountName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String }
    },
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
    isOpen: { type: Boolean, default: false }, // For toggling kitchen status instantly
    maxOrdersPerSlot: { type: Number, default: 20 }, // For throttling orders
    // Finance / Payouts
    walletBalance: { type: Number, default: 0 }, // For Customers
    commissionRate: { type: Number }, // Specific Chef Commission Override (optional)
    referralCode: { type: String, unique: true, sparse: true }, // For Invite & Earn
    
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

// Add Geospatial Indexes
userSchema.index({ kitchenLocation: '2dsphere' });
userSchema.index({ 'addresses.location': '2dsphere' });

// Add Compound Index for filtering users
userSchema.index({ role: 1, city: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
