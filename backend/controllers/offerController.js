const Offer = require('../models/Offer');
const { logAction } = require('../utils/auditLogger');

const getOffers = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'subadmin' || req.user.role === 'admin') {
            // Subadmins only see their city's offers
            query = { scope: 'City', city: req.user.city };
        } else if (req.user.role === 'chef') {
            query = { scope: 'Chef', targetChef: req.user._id };
        } else if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        const offers = await Offer.find(query).populate('city', 'name');
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offers', error: error.message });
    }
};

const getPublicOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ isActive: true, validUntil: { $gte: new Date() } }).populate('city', 'name');
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offers', error: error.message });
    }
};

const createOffer = async (req, res) => {
    try {
        const { code, description, discountType, discountPercentage, discountFlat, maxDiscountAmount, minOrderValue, scope, validUntil, city } = req.body;
        
        let actualScope = scope;
        let targetChef = null;

        if (req.user.role === 'chef') {
            actualScope = 'Chef';
            targetChef = req.user._id;
        } else if (req.user.role === 'subadmin' || req.user.role === 'admin') {
            if (scope === 'Global') {
                return res.status(403).json({ message: 'Sub-admins cannot create global offers' });
            }
            if (String(city) !== String(req.user.city)) {
                return res.status(403).json({ message: 'Sub-admins can only create offers for their own city' });
            }
        } else if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const offer = await Offer.create({
            code, description, 
            discountType: discountType || 'percentage',
            discountPercentage, 
            discountFlat,
            maxDiscountAmount, minOrderValue, 
            scope: actualScope, 
            city: actualScope === 'City' ? city : null,
            targetChef,
            validUntil,
            createdBy: req.user._id
        });

        await logAction(req.user._id, req.user.role, 'CREATED_OFFER', 'Offer', offer._id, null, code, req);

        res.status(201).json(offer);
    } catch (error) {
        res.status(500).json({ message: 'Error creating offer', error: error.message });
    }
};

const updateOfferStatus = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: 'Offer not found' });

        if (req.user.role === 'subadmin' || req.user.role === 'admin') {
            if (String(offer.city) !== String(req.user.city)) {
                return res.status(403).json({ message: 'Not authorized to modify this offer' });
            }
        } else if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        const oldValue = offer.isActive;
        offer.isActive = !offer.isActive;
        const updatedOffer = await offer.save();

        await logAction(req.user._id, req.user.role, 'TOGGLED_OFFER', 'Offer', offer._id, oldValue, offer.isActive, req);

        res.json(updatedOffer);
    } catch (error) {
        res.status(500).json({ message: 'Error updating offer status', error: error.message });
    }
};

module.exports = { getOffers, getPublicOffers, createOffer, updateOfferStatus };
