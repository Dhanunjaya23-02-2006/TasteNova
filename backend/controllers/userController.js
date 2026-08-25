const User = require('../models/User');
const City = require('../models/City');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
}

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { email } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    try {
        const otpRes = await fetch('https://otp-service-beta.vercel.app/api/otp/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, type: 'numeric', organization: 'TasteNova', subject: 'Account Verification OTP' })
        });
        const otpData = await otpRes.json();

        if (otpRes.ok) {
            res.status(200).json({
                message: 'OTP sent to your email.'
            });
        } else {
            res.status(500).json({ message: 'Failed to dispatch OTP: ' + (otpData.message || 'Service Error') });
        }
    } catch (error) {
        console.error('External OTP Service Error:', error);
        res.status(500).json({ message: 'OTP service is currently unavailable.' });
    }
};

// @desc    Register a new partner (chef/delivery)
// @route   POST /api/users/register-partner
// @access  Public
const registerPartner = async (req, res) => {
    const { email } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    try {
        const otpRes = await fetch('https://otp-service-beta.vercel.app/api/otp/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, type: 'numeric', organization: 'TasteNova', subject: 'Partner Registration OTP' })
        });
        const otpData = await otpRes.json();

        if (otpRes.ok) {
            res.status(200).json({
                message: 'OTP sent to your email.'
            });
        } else {
            res.status(500).json({ message: 'Failed to dispatch OTP: ' + (otpData.message || 'Service Error') });
        }
    } catch (error) {
        console.error('External OTP Service Error:', error);
        res.status(500).json({ message: 'OTP service is currently unavailable.' });
    }
};

// @desc    Check if roles are available
// @route   GET /api/users/check-roles
// @access  Public
const checkRoleAvailability = async (req, res) => {
    try {
        const superadmin = await User.findOne({ role: 'superadmin' });
        const admin = await User.findOne({ role: 'admin' });
        res.json({ 
            superadminExists: !!superadmin,
            adminExists: !!admin
        });
    } catch (error) {
        res.status(500).json({ message: 'Error checking role availability' });
    }
};

// @desc    Verify Email OTP
// @route   POST /api/users/verify-otp
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

            // Special Role Assignment Logic
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
                status = 'pending'; // Require approval
            } else if (role === 'chef') {
                assignedRole = 'chef';
                status = 'pending'; // Require approval
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
                        // Allow assigning to city if within deliveryRadius (or a generous fallback like 50km if radius isn't strictly enforced for registration)
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
                kitchenLocation: kitchenLocData
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    businessName: user.businessName,
                    addresses: user.addresses,
                    token: generateToken(user._id)
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

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            if (user.status === 'suspended') {
                return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                addresses: user.addresses,
                businessName: user.businessName,
                description: user.description,
                profilePic: user.profilePic,
                kitchenImage: user.kitchenImage,
                isIdVerified: user.isIdVerified,
                isFssaiVerified: user.isFssaiVerified,
                isKitchenVerified: user.isKitchenVerified,
                rating: user.rating,
                numReviews: user.numReviews,
                following: user.following || [],
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                addresses: user.addresses,
                role: user.role,
                businessName: user.businessName,
                description: user.description,
                profilePic: user.profilePic,
                kitchenImage: user.kitchenImage,
                isIdVerified: user.isIdVerified,
                isFssaiVerified: user.isFssaiVerified,
                isKitchenVerified: user.isKitchenVerified,
                rating: user.rating,
                numReviews: user.numReviews,
                following: user.following || []
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Admin Location
// @route   GET /api/users/admin-location
// @access  Public
const getAdminLocation = async (req, res) => {
    let targetUser;
    if (req.query.chefId) {
        targetUser = await User.findById(req.query.chefId).select('addresses');
    }
    if (!targetUser) {
        targetUser = await User.findOne({ role: 'admin' }).select('addresses');
    }

    if (targetUser && targetUser.addresses && targetUser.addresses.length > 0) {
        res.json(targetUser.addresses[0].location);
    } else {
        // Default location (e.g., Mumbai) if admin/chef not found or no location set
        res.json({ lat: 19.0760, lng: 72.8777 });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            if (req.body.role && ['user', 'chef', 'delivery'].includes(req.body.role)) {
                user.role = req.body.role;
            }
            user.businessName = req.body.businessName || user.businessName;
            user.description = req.body.description || user.description;
            user.kitchenImage = req.body.kitchenImage || user.kitchenImage;
            if (req.body.profilePic !== undefined) {
                user.profilePic = req.body.profilePic;
            }

            if (req.body.deliveryRadius) {
                user.deliveryRadius = req.body.deliveryRadius;
            }
            if (req.body.kitchenLocation) {
                user.kitchenLocation = req.body.kitchenLocation;
            }

            if (req.body.addresses) {
                user.addresses = req.body.addresses;
            }

            if (req.body.vehicleType) {
                user.vehicleType = req.body.vehicleType;
            }
            if (req.body.vehicleNumber) {
                user.vehicleNumber = req.body.vehicleNumber;
            }
            if (req.body.bankDetails) {
                user.bankDetails = {
                    ...user.bankDetails,
                    ...req.body.bankDetails
                };
            }
            if (req.body.documents) {
                user.documents = {
                    ...user.documents,
                    ...req.body.documents
                };
            }

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                businessName: updatedUser.businessName,
                description: updatedUser.description,
                profilePic: updatedUser.profilePic,
                kitchenImage: updatedUser.kitchenImage,
                isIdVerified: updatedUser.isIdVerified,
                isFssaiVerified: updatedUser.isFssaiVerified,
                isKitchenVerified: updatedUser.isKitchenVerified,
                rating: updatedUser.rating,
                numReviews: updatedUser.numReviews,
                addresses: updatedUser.addresses,
                vehicleType: updatedUser.vehicleType,
                vehicleNumber: updatedUser.vehicleNumber,
                bankDetails: updatedUser.bankDetails,
                documents: updatedUser.documents,
                following: updatedUser.following || [],
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(400).json({ message: error.message || 'Invalid user data' });
    }
};

// @desc    Forgot Password Request OTP
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { identifier } = req.body; // Can be email or phone
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });

    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    try {
        const otpRes = await fetch('https://otp-service-beta.vercel.app/api/otp/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, type: 'numeric', organization: 'TasteNova', subject: 'Password Reset OTP' })
        });
        const otpData = await otpRes.json();

        if (otpRes.ok) {
            res.json({ message: 'Password reset OTP sent to your email' });
        } else {
            res.status(500).json({ message: 'Failed to send reset code: ' + (otpData.message || 'Service Error') });
        }
    } catch (error) {
        console.error('External OTP Service Error:', error);
        res.status(500).json({ message: 'Password reset service is currently unavailable.' });
    }
};

// @desc    Verify OTP and Reset Password
// @route   PUT /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { identifier, otp, newPassword } = req.body;
    const user = await User.findOne({ email: identifier });

    if (!user) return res.status(404).json({ message: 'User not found' });

    try {
        const verifyRes = await fetch('https://otp-service-beta.vercel.app/api/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, otp: otp })
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            res.json({ message: 'Password reset successfully!' });
        } else {
            return res.status(400).json({ message: verifyData.message || 'Invalid reset OTP' });
        }
    } catch (error) {
        console.error('External OTP reset verification error:', error);
        return res.status(500).json({ message: 'OTP verification service unavailable' });
    }
};

// @desc    Get All Users for Management
// @route   GET /api/users/all-management
// @access  Private/Admin
const getAllManagement = async (req, res) => {
    try {
        const query = {};
        if (req.user.role !== 'superadmin') {
            query.city = req.user.city;
        }

        const users = await User.find({ ...query, role: 'user' }).select('-password').populate('city', 'name state');
        const chefs = await User.find({ ...query, role: 'chef' }).select('-password').populate('city', 'name state');
        const delivery = await User.find({ ...query, role: 'delivery' }).select('-password').populate('city', 'name state');
        
        const adminQuery = req.user.role === 'superadmin' ? { role: { $in: ['admin', 'subadmin'] } } : { role: { $in: ['admin', 'subadmin'] }, city: req.user.city };
        const admins = await User.find(adminQuery).select('-password').populate('city', 'name state');
        
        res.json({ users, chefs, delivery, admins });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching management data' });
    }
};

// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  Private/Superadmin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

// @desc    Update User Status & Verifications
// @route   PUT /api/users/update-status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
    try {
        const { userId, status, isIdVerified, isFssaiVerified, isKitchenVerified } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.user.role !== 'superadmin' && String(user.city) !== String(req.user.city)) {
            return res.status(403).json({ message: 'Not authorized for this city' });
        }

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (isIdVerified !== undefined) updateData.isIdVerified = isIdVerified;
        if (isFssaiVerified !== undefined) updateData.isFssaiVerified = isFssaiVerified;
        if (isKitchenVerified !== undefined) updateData.isKitchenVerified = isKitchenVerified;
        
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        res.json({ message: `User updated successfully`, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

// @desc    Bulk Delete Users
// @route   POST /api/users/bulk-delete
// @access  Private/Superadmin
const bulkDeleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || !userIds.length) return res.status(400).json({ message: 'No users selected' });

        await User.deleteMany({ _id: { $in: userIds } });
        res.json({ message: 'Selected users removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error in bulk deletion' });
    }
};

// @desc    Update chef operating hours
// @route   PUT /api/users/operating-hours
// @access  Private/Chef
const updateOperatingHours = async (req, res) => {
    const { lunch, dinner } = req.body;

    if (req.user.role !== 'chef' && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as chef' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.operatingHours = {
            lunch: lunch || user.operatingHours?.lunch,
            dinner: dinner || user.operatingHours?.dinner
        };

        const updatedUser = await user.save();
        res.json(updatedUser.operatingHours);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get featured chefs
// @route   GET /api/users/chefs/featured
// @access  Public
const getFeaturedChefs = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        
        if (!lat || !lng || lat === 'undefined' || lng === 'undefined' || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
            // Require location before showing nearby chefs
            return res.json([]); 
        }

        const chefs = await User.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distance",
                    key: "kitchenLocation",
                    spherical: true,
                    query: { role: 'chef', status: 'active', isOpen: true },
                    distanceMultiplier: 0.001 // Convert meters to km
                }
            },
            {
                $match: {
                    $expr: {
                        $lte: ["$distance", { $ifNull: ["$deliveryRadius", 6] }]
                    }
                }
            },
            {
                $sort: { isPinned: -1, rating: -1, numReviews: -1, distance: 1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    password: 0
                }
            }
        ]);
            
        res.json(chefs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllChefs = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        
        if (!lat || !lng || lat === 'undefined' || lng === 'undefined' || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
            // If no valid location provided, return active open chefs without geo filtering
            try {
                const { APIFeatures, sendPaginatedResponse } = require('../utils/apiFeatures');
                const features = new APIFeatures(
                    User.find({ role: 'chef', status: 'active', isOpen: true }).select('-password'),
                    req.query
                )
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();

                // Default sorting for chefs is by pinned and rating if not specified in query
                if (!req.query.sort) {
                    features.query = features.query.sort({ isPinned: -1, rating: -1 });
                }

                return await sendPaginatedResponse(res, features, User); 
            } catch (paginationError) {
                // Fallback: simple query if pagination utility fails
                const chefs = await User.find({ role: 'chef', status: 'active', isOpen: true })
                    .select('-password')
                    .sort({ isPinned: -1, rating: -1 })
                    .limit(50);
                return res.json(chefs);
            }
        }

        const chefs = await User.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: "distance",
                    key: "kitchenLocation",
                    spherical: true,
                    query: { role: 'chef', status: 'active', isOpen: true },
                    distanceMultiplier: 0.001 // Convert meters to km
                }
            },
            {
                $match: {
                    $expr: {
                        $lte: ["$distance", { $ifNull: ["$deliveryRadius", 6] }]
                    }
                }
            },
            {
                $sort: { isPinned: -1, rating: -1, numReviews: -1, distance: 1 }
            },
            {
                $project: {
                    password: 0
                }
            }
        ]);
            
        res.json(chefs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChefById = async (req, res) => {
    try {
        const chef = await User.findById(req.params.id).select('-password');
        if (!chef || chef.role !== 'chef') {
            return res.status(404).json({ message: 'Chef not found' });
        }
        res.json(chef);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleFollowChef = async (req, res) => {
    try {
        const chefId = req.params.id;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const chef = await User.findById(chefId);
        if (!chef || chef.role !== 'chef') {
            return res.status(404).json({ message: 'Chef not found' });
        }

        const isFollowing = user.following && user.following.includes(chefId);

        if (isFollowing) {
            // Unfollow
            user.following = user.following.filter(id => id.toString() !== chefId);
        } else {
            // Follow
            if (!user.following) user.following = [];
            user.following.push(chefId);
        }

        await user.save();
        res.json({ message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully', following: user.following });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update chef settings (hours, status, delivery radius, max orders)
// @route   PUT /api/users/chef-settings
// @access  Private/Chef
const updateChefSettings = async (req, res) => {
    if (req.user.role !== 'chef' && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as chef' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.operatingHours) user.operatingHours = req.body.operatingHours;
        if (req.body.deliveryRadius !== undefined) user.deliveryRadius = req.body.deliveryRadius;
        if (req.body.maxOrdersPerSlot !== undefined) user.maxOrdersPerSlot = req.body.maxOrdersPerSlot;
        
        // Kitchen Information updates
        if (req.body.businessName !== undefined) user.businessName = req.body.businessName;
        if (req.body.description !== undefined) user.description = req.body.description;
        if (req.body.kitchenImage !== undefined) user.kitchenImage = req.body.kitchenImage;
        
        // Documents updates
        if (req.body.documents) {
            if (!user.documents) user.documents = {};
            if (req.body.documents.idProof !== undefined) user.documents.idProof = req.body.documents.idProof;
            if (req.body.documents.fssaiCertificate !== undefined) user.documents.fssaiCertificate = req.body.documents.fssaiCertificate;
        }
        
        // Bank Details updates
        if (req.body.bankDetails) {
            if (!user.bankDetails) user.bankDetails = {};
            if (req.body.bankDetails.accountName !== undefined) user.bankDetails.accountName = req.body.bankDetails.accountName;
            if (req.body.bankDetails.accountNumber !== undefined) user.bankDetails.accountNumber = req.body.bankDetails.accountNumber;
            if (req.body.bankDetails.ifscCode !== undefined) user.bankDetails.ifscCode = req.body.bankDetails.ifscCode;
            if (req.body.bankDetails.bankName !== undefined) user.bankDetails.bankName = req.body.bankDetails.bankName;
        }

        if (req.body.isOpen !== undefined) {
            if (req.body.isOpen === true) {
                if (!user.isIdVerified || !user.isFssaiVerified || !user.isKitchenVerified) {
                    return res.status(403).json({ message: 'Kitchen cannot be opened until all documents (ID, FSSAI, Kitchen) are verified by Admin.' });
                }
            }
            user.isOpen = req.body.isOpen;
        }

        const updatedUser = await user.save();
        res.json({
            operatingHours: updatedUser.operatingHours,
            deliveryRadius: updatedUser.deliveryRadius,
            maxOrdersPerSlot: updatedUser.maxOrdersPerSlot,
            isOpen: updatedUser.isOpen,
            businessName: updatedUser.businessName,
            description: updatedUser.description,
            kitchenImage: updatedUser.kitchenImage,
            documents: updatedUser.documents,
            bankDetails: updatedUser.bankDetails
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add a new address to user profile
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
    try {
        const { 
            label, receiverName, phone, houseFlat, floor, building, 
            street, area, landmark, city, state, pincode, 
            formattedAddress, location, deliveryInstructions, isDefault 
        } = req.body;
        
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newAddress = {
            label, receiverName, phone, houseFlat, floor, building, 
            street, area, landmark, city, state, pincode, 
            formattedAddress, location, deliveryInstructions, isDefault
        };

        if (isDefault) {
            user.addresses.forEach(a => a.isDefault = false);
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({ message: 'Address added', addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an address from user profile
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses = user.addresses.filter(
            (address) => address._id.toString() !== req.params.id
        );

        await user.save();

        res.json({ message: 'Address removed', addresses: user.addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a payment method to user profile
// @route   POST /api/users/payment-methods
// @access  Private
const addPaymentMethod = async (req, res) => {
    try {
        const { cardNumber, cardName, expiryDate, cardType, isDefault } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If this is set to default, unset others
        if (isDefault) {
            user.paymentMethods.forEach(pm => pm.isDefault = false);
        }

        const newPaymentMethod = {
            cardNumber,
            cardName,
            expiryDate,
            cardType: cardType || 'VISA',
            isDefault: isDefault || (user.paymentMethods.length === 0)
        };

        user.paymentMethods.push(newPaymentMethod);
        await user.save();

        res.status(201).json({ message: 'Payment method added', paymentMethods: user.paymentMethods });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a payment method from user profile
// @route   DELETE /api/users/payment-methods/:id
// @access  Private
const deletePaymentMethod = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.paymentMethods = user.paymentMethods.filter(
            (pm) => pm._id.toString() !== req.params.id
        );

        // If we deleted the default one and there are others left, make the first one default
        if (user.paymentMethods.length > 0 && !user.paymentMethods.some(pm => pm.isDefault)) {
            user.paymentMethods[0].isDefault = true;
        }

        await user.save();

        res.json({ message: 'Payment method removed', paymentMethods: user.paymentMethods });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user favourites (following chefs)
// @route   GET /api/users/favourites
// @access  Private
const getUserFavourites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('following', 'name kitchenName profileImage rating');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.following || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get customer wallet
// @route   GET /api/users/wallet
// @access  Private
const getCustomerWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ balance: user.walletBalance || 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Top up customer wallet
// @route   POST /api/users/wallet/topup
// @access  Private
const topUpCustomerWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const { amount } = req.body;
        user.walletBalance = (user.walletBalance || 0) + Number(amount);
        await user.save();
        
        res.json({ balance: user.walletBalance, message: 'Wallet topped up successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Ensure bcrypt is available
        const bcrypt = require('bcrypt');
        
        // Find user by ID and include password since it's deselected by default
        const user = await User.findById(req.user._id).select('+password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }
        
        // Enforce complexity on backend just in case
        const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).+$/;
        if (!regex.test(newPassword)) {
            return res.status(400).json({ message: 'Password must contain at least one number, one symbol, and one uppercase letter' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error during password change' });
    }
};
module.exports = {
    registerUser,
    registerPartner,
    verifyOtp,
    forgotPassword,
    resetPassword,
    authUser,
    getUserProfile,
    getAdminLocation,
    updateUserProfile,
    checkRoleAvailability,
    getAllManagement,
    deleteUser,
    updateUserStatus,
    bulkDeleteUsers,
    updateOperatingHours,
    getFeaturedChefs,
    getAllChefs,
    getChefById,
    toggleFollowChef,
    updateChefSettings,
    addAddress,
    deleteAddress,
    addPaymentMethod,
    deletePaymentMethod,
    getUserFavourites,
    getCustomerWallet,
    topUpCustomerWallet,
    changePassword
};
