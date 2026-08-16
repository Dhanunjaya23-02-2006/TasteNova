const Order = require('../models/Order');
const User = require('../models/User');
const Zone = require('../models/Zone');
const City = require('../models/City');
const { clearCache } = require('../middleware/cacheMiddleware');

// ========================
// DASHBOARD
// ========================
const getDashboard = async (req, res) => {
    try {
        const cityFilter = req.cityFilter;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            todayOrders,
            totalChefs,
            totalDelivery,
            totalCustomers,
            zones,
            liveOrders
        ] = await Promise.all([
            Order.find({ ...cityFilter, createdAt: { $gte: today } }),
            User.countDocuments({ ...cityFilter, role: 'chef', status: 'active' }),
            User.countDocuments({ ...cityFilter, role: 'delivery', status: 'active' }),
            User.countDocuments({ ...cityFilter, role: 'user' }),
            Zone.find(cityFilter),
            Order.find({ ...cityFilter, status: { $in: ['Placed', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery'] } })
                .populate('user', 'name')
                .populate('chef', 'name kitchenName')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        res.json({
            stats: {
                todayOrders: todayOrders.length,
                todayRevenue,
                totalChefs,
                totalDelivery,
                totalCustomers,
                activeZones: zones.length
            },
            liveOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
    }
};

// ========================
// ZONES MANAGEMENT
// ========================
const getZones = async (req, res) => {
    try {
        const zones = await Zone.find(req.cityFilter).populate('city', 'name');
        res.json(zones);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching zones', error: error.message });
    }
};

const createZone = async (req, res) => {
    try {
        // Enforce city filter so Admin can only create zones in their assigned cities
        // If they only have one assigned city, default to it
        let cityId = req.body.city;
        if (!cityId && req.user.assignedCities?.length > 0) {
            cityId = req.user.assignedCities[0];
        }
        
        if (!cityId) return res.status(400).json({ message: 'City is required' });

        const zone = new Zone({ ...req.body, city: cityId });
        await zone.save();
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.status(201).json(zone);
    } catch (error) {
        res.status(400).json({ message: 'Error creating zone', error: error.message });
    }
};

const updateZone = async (req, res) => {
    try {
        const zone = await Zone.findOneAndUpdate(
            { _id: req.params.id, ...req.cityFilter },
            req.body,
            { new: true }
        );
        if (!zone) return res.status(404).json({ message: 'Zone not found' });
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.json(zone);
    } catch (error) {
        res.status(400).json({ message: 'Error updating zone', error: error.message });
    }
};

const deleteZone = async (req, res) => {
    try {
        const zone = await Zone.findOneAndDelete({ _id: req.params.id, ...req.cityFilter });
        if (!zone) return res.status(404).json({ message: 'Zone not found' });
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.json({ message: 'Zone deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting zone', error: error.message });
    }
};

// ========================
// SUB-ADMIN MANAGEMENT
// ========================
const getSubAdmins = async (req, res) => {
    try {
        const subAdmins = await User.find({ role: 'subadmin', ...req.cityFilter })
            .populate('assignedZones', 'name')
            .select('-password');
        res.json(subAdmins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subadmins', error: error.message });
    }
};

const createSubAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, assignedZones } = req.body;
        
        // Inherit the regional admin's city (or primary assigned city)
        const city = req.user.assignedCities?.length > 0 ? req.user.assignedCities[0] : req.user.city;
        
        const subAdmin = new User({
            name, email, password, phone,
            role: 'subadmin',
            city, // Scope them to this city
            assignedCities: [city], // Scope them to this city
            assignedZones // Specific zones in the city
        });

        await subAdmin.save();
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.status(201).json({ message: 'Subadmin created', subAdmin });
    } catch (error) {
        res.status(400).json({ message: 'Error creating subadmin', error: error.message });
    }
};

const updateSubAdmin = async (req, res) => {
    try {
        const subAdmin = await User.findOneAndUpdate(
            { _id: req.params.id, role: 'subadmin', ...req.cityFilter },
            req.body,
            { new: true }
        ).select('-password');
        
        if (!subAdmin) return res.status(404).json({ message: 'Subadmin not found' });
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.json(subAdmin);
    } catch (error) {
        res.status(400).json({ message: 'Error updating subadmin', error: error.message });
    }
};

const deleteSubAdmin = async (req, res) => {
    try {
        const subAdmin = await User.findOneAndDelete({ _id: req.params.id, role: 'subadmin', ...req.cityFilter });
        if (!subAdmin) return res.status(404).json({ message: 'Subadmin not found' });
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        res.json({ message: 'Subadmin deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subadmin', error: error.message });
    }
};

// ========================
// OPERATIONAL MODULES
// ========================

const getOrders = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = { ...req.cityFilter, ...req.zoneFilter };
        if (status && status !== 'All') query.status = status;

        const orders = await Order.find(query)
            .populate('user', 'name phone email')
            .populate('chef', 'name kitchenName')
            .populate('deliveryPartner', 'name phone')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

const getChefs = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = { role: 'chef', ...req.cityFilter, ...req.zoneFilter };
        if (status && status !== 'All') query.status = status;

        const chefs = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(chefs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chefs', error: error.message });
    }
};

const getCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { role: 'user', ...req.cityFilter }; // Customers are often city-wide, but we'll apply filter
        
        const customers = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

const getDeliveryPartners = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = { role: 'delivery', ...req.cityFilter }; // Delivery partners operate city-wide mostly
        if (status && status !== 'All') query.status = status;

        const deliveryPartners = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(deliveryPartners);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching delivery partners', error: error.message });
    }
};

// ========================
// CITY SETTINGS
// ========================
const getCitySettings = async (req, res) => {
    try {
        const cityId = req.user.city || (req.user.assignedCities && req.user.assignedCities[0]);
        if (!cityId) return res.status(400).json({ message: 'No city assigned to this admin' });

        const city = await City.findById(cityId);
        if (!city) return res.status(404).json({ message: 'City not found' });

        res.json(city);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching city settings', error: error.message });
    }
};

const updateCitySettings = async (req, res) => {
    try {
        const cityId = req.user.city || (req.user.assignedCities && req.user.assignedCities[0]);
        if (!cityId) return res.status(400).json({ message: 'No city assigned to this admin' });

        const { baseDeliveryFee, perKmFee, freeDeliveryThreshold, commissionRate, refundThreshold, deliveryRadius } = req.body;
        
        const city = await City.findByIdAndUpdate(
            cityId,
            { baseDeliveryFee, perKmFee, freeDeliveryThreshold, commissionRate, refundThreshold, deliveryRadius },
            { new: true }
        );

        if (!city) return res.status(404).json({ message: 'City not found' });
        
        clearCache('/api/cities');
        if (req.app.get('io')) req.app.get('io').emit('admin_refresh');
        
        res.json(city);
    } catch (error) {
        res.status(500).json({ message: 'Error updating city settings', error: error.message });
    }
};

module.exports = {
    getDashboard,
    getZones, createZone, updateZone, deleteZone,
    getSubAdmins, createSubAdmin, updateSubAdmin, deleteSubAdmin,
    getOrders, getChefs, getCustomers, getDeliveryPartners,
    getCitySettings, updateCitySettings
};
