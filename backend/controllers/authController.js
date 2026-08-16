const User = require('../models/User');
const City = require('../models/City');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 mins
    });

    if (refreshToken) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
}

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.status === 'suspended') {
                return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
            }

            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            // Save refresh token to user in DB
            user.refreshTokens = user.refreshTokens || [];
            user.refreshTokens.push(refreshToken);

            // Force kitchen closed on new login session so they have to manually open it
            if (user.role === 'chef') {
                user.isOpen = false;
            }

            await user.save();

            setAuthCookies(res, accessToken, refreshToken);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                addresses: user.addresses,
                city: user.city,
                assignedCities: user.assignedCities,
                assignedZones: user.assignedZones,
                customRole: user.customRole,
                // Do not send tokens in response body anymore for web clients (handled by cookies)
                // However, Mobile clients might need it in the response if they don't use cookies. 
                // We'll return it for mobile compatibility.
                accessToken,
                refreshToken
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Verify Email OTP & Register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { name, email, password, phone, address, location, role, emailOtp } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    try {
        const verifyRes = await fetch('https://otp-service-beta.vercel.app/api/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: emailOtp })
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            let assignedRole = 'user';
            let status = 'active';
            const userCount = await User.countDocuments({});
            const superadminExists = await User.findOne({ role: 'superadmin' });
            const adminExists = await User.findOne({ role: 'admin' });

            if (userCount === 0 || (role === 'superadmin' && !superadminExists)) {
                assignedRole = 'superadmin';
            } else if (role === 'admin' && !adminExists) {
                assignedRole = 'admin';
            } else if (role === 'delivery') {
                assignedRole = 'delivery';
                status = 'pending';
            } else if (role === 'chef') {
                assignedRole = 'chef';
                status = 'pending';
            }

            const addresses = [];
            if (address || location) {
                addresses.push({
                    label: 'Home',
                    streetAddress: address || 'No address provided',
                    location: location || { lat: 19.0760, lng: 72.8777 }
                });
            }

            let kitchenLocData = undefined;
            if (assignedRole === 'chef' && location) {
                kitchenLocData = {
                    type: 'Point',
                    coordinates: [location.lng, location.lat]
                };
            }

            let assignedCityId = undefined;
            if (location && location.lat && location.lng) {
                const cities = await City.find({ isActive: true });
                let closestCity = null;
                let minDistance = Infinity;
                for (const city of cities) {
                    if (city.latitude && city.longitude) {
                        const dist = getDistanceFromLatLonInKm(location.lat, location.lng, city.latitude, city.longitude);
                        if (dist < minDistance && dist <= (city.deliveryRadius || 50)) {
                            minDistance = dist;
                            closestCity = city;
                        }
                    }
                }
                if (closestCity) {
                    assignedCityId = closestCity._id;
                }
            }

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                phone,
                role: assignedRole,
                status,
                city: assignedCityId,
                addresses,
                isPhoneVerified: true,
                isEmailVerified: true,
                businessName: req.body.businessName,
                description: req.body.description,
                kitchenImage: req.body.kitchenImage,
                fssaiNumber: req.body.fssaiNumber,
                kitchenLocation: kitchenLocData,
                refreshTokens: []
            });

            if (user) {
                const accessToken = generateAccessToken(user._id);
                const refreshToken = generateRefreshToken(user._id);
                
                user.refreshTokens.push(refreshToken);
                await user.save();

                setAuthCookies(res, accessToken, refreshToken);

                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    businessName: user.businessName,
                    addresses: user.addresses,
                    accessToken,
                    refreshToken
                });
            } else {
                res.status(400).json({ message: 'Invalid user data during creation' });
            }
        } else {
            return res.status(400).json({ message: verifyData.message || 'Invalid OTP provided' });
        }
    } catch (error) {
        console.error('External OTP verification error:', error);
        return res.status(500).json({ message: 'OTP verification service unavailable' });
    }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    // Check both cookie (web) and body (mobile) for refresh token
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) return res.status(401).json({ message: 'Not authenticated, no refresh token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.refreshTokens.includes(token)) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user._id);
        
        // Optional: Token Rotation (Remove old refresh token, generate new one)
        // For simplicity and to avoid race conditions with multiple concurrent requests from same user,
        // we'll keep the same refresh token until it expires, but this can be enhanced.

        setAuthCookies(res, newAccessToken, null); // Don't overwrite refresh token cookie here unless rotating

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        // Token might be expired or malformed.
        // We should remove it from the DB if we know who the user is, but here we just return 403.
        res.status(403).json({ message: 'Refresh token expired or invalid' });
    }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    
    if (req.user && token) {
        // Remove token from DB
        req.user.refreshTokens = req.user.refreshTokens.filter(rt => rt !== token);
        await req.user.save();
    }

    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });

    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
    authUser,
    verifyOtp,
    refreshToken,
    logout
};
