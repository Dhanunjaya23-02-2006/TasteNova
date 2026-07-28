const City = require('../models/City');

const getCities = async (req, res) => {
    try {
        const query = req.query.all ? {} : { isActive: true };
        const cities = await City.find(query);
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch cities' });
    }
};

const createCity = async (req, res) => {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
        return res.status(403).json({ message: 'Not authorized to manage cities' });
    }
    
    try {
        const { name, state, country, latitude, longitude, deliveryRadius } = req.body;
        const cityExists = await City.findOne({ name, state });
        
        if (cityExists) {
            return res.status(400).json({ message: 'City already exists in this state' });
        }
        
        const city = await City.create({
            name, state, country, latitude, longitude, deliveryRadius
        });
        
        res.status(201).json(city);
    } catch (error) {
        res.status(500).json({ message: 'Error creating city', error: error.message });
    }
};

const updateCityStatus = async (req, res) => {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
        return res.status(403).json({ message: 'Not authorized to toggle city status' });
    }

    try {
        const city = await City.findById(req.params.id);
        if (city) {
            city.isActive = !city.isActive;
            const updatedCity = await city.save();
            res.json(updatedCity);
        } else {
            res.status(404).json({ message: 'City not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating city status' });
    }
};

const updateCity = async (req, res) => {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
        return res.status(403).json({ message: 'Not authorized to edit cities' });
    }

    try {
        const { baseDeliveryFee, perKmFee, isActive, freeDeliveryThreshold } = req.body;
        
        const city = await City.findById(req.params.id);
        if (!city) {
            return res.status(404).json({ message: 'City not found' });
        }

        if (baseDeliveryFee !== undefined) city.baseDeliveryFee = baseDeliveryFee;
        if (perKmFee !== undefined) city.perKmFee = perKmFee;
        if (isActive !== undefined) city.isActive = isActive;
        if (freeDeliveryThreshold !== undefined) city.freeDeliveryThreshold = freeDeliveryThreshold;

        const updatedCity = await city.save();
        
        // Notify all clients (customers) about the city setting update so they can refresh delivery rates
        req.app.get('io').emit('city_updated', updatedCity);

        res.json(updatedCity);
    } catch (error) {
        res.status(500).json({ message: 'Error updating city', error: error.message });
    }
};

const deleteCity = async (req, res) => {
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.role !== 'subadmin') {
        return res.status(403).json({ message: 'Not authorized to delete cities' });
    }
    try {
        const city = await City.findById(req.params.id);
        if (!city) {
            return res.status(404).json({ message: 'City not found' });
        }
        await City.deleteOne({ _id: city._id });
        
        req.app.get('io').emit('city_deleted', city._id);
        res.json({ message: 'City removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting city', error: error.message });
    }
};

module.exports = { getCities, createCity, updateCityStatus, updateCity, deleteCity };
