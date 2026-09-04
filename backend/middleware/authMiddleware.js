const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in header first (most reliable for cross-origin)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Fallback to cookie (same-origin or production)
    else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user deleted' });
        }

        return next();
    } catch (error) {
        // Distinguish between expired token and invalid token
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const chef = (req, res, next) => {
    if (req.user && (req.user.role === 'chef' || req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a chef' });
    }
};

const delivery = (req, res, next) => {
    if (req.user && (req.user.role === 'delivery' || req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as delivery partner' });
    }
};

const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a SUPERADMIN' });
    }
};

// Sub-admin: allows subadmin, admin, and superadmin roles
const subadmin = (req, res, next) => {
    if (req.user && ['subadmin', 'admin', 'superadmin'].includes(req.user.role)) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a Sub-Admin' });
    }
};

// Regional/Zonal scope: auto-attaches city and zone filters
const regionalScope = (req, res, next) => {
    if (req.user.role === 'superadmin') {
        req.cityFilter = req.query.cityId ? { city: req.query.cityId } : {};
        req.zoneFilter = req.query.zoneId ? { zone: req.query.zoneId } : {};
    } else if (req.user.role === 'admin') {
        // Admin (Regional): sees all zones within their assigned cities
        req.cityFilter = req.user.assignedCities?.length > 0 ? { city: { $in: req.user.assignedCities } } : {};
        req.zoneFilter = {}; // By default, no zone restriction means they see all zones in those cities
    } else if (req.user.role === 'subadmin') {
        // Subadmin (Zonal): sees ONLY their assigned zones
        req.cityFilter = req.user.assignedCities?.length > 0 ? { city: { $in: req.user.assignedCities } } : {};
        req.zoneFilter = req.user.assignedZones?.length > 0 ? { zone: { $in: req.user.assignedZones } } : {};
    } else {
        req.cityFilter = req.user.city ? { city: req.user.city } : {};
        req.zoneFilter = {};
    }
    next();
};

module.exports = { protect, admin, chef, delivery, superAdmin, subadmin, cityScope: regionalScope };
