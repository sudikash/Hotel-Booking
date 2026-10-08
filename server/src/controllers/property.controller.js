const Property = require('../models/property.model');
const { canManage, escapeRegex, getPagination, pickFields, respondWithError } = require('../utils/api.utils');

const createProperty = async (req, res) => {
    try {
        const property = await Property.create({ ...req.body, owner: req.user.id });
        return res.status(201).json({ property });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const listProperties = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const filter = { status: 'published' };
        
        const searchQuery = req.query.search || req.query.city;
        if (searchQuery) {
            const regex = new RegExp(escapeRegex(searchQuery), 'i');
            filter.$or = [
                { 'location.city': regex },
                { 'location.country': regex },
                { name: regex }
            ];
        }

        if (req.query.guests) {
            filter.maxGuests = { $gte: Number(req.query.guests) };
        }

        const [items, total] = await Promise.all([
            Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Property.countDocuments(filter)
        ]);
        return res.status(200).json({ items, page, limit, total });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const listFeaturedProperties = async (req, res) => {
    try {
        const items = await Property.aggregate([
            { $match: { status: 'published' } },
            { $sample: { size: 5 } }
        ]);
        return res.status(200).json({ items });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const listMyProperties = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const filter = req.user.role === 'admin' ? {} : { owner: req.user.id };
        const [items, total] = await Promise.all([
            Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Property.countDocuments(filter)
        ]);
        return res.status(200).json({ items, page, limit, total });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const getProperty = async (req, res) => {
    try {
        const query = Property.findById(req.params.propertyId);
        const property = typeof query?.populate === 'function'
            ? await query.populate('owner', 'userName email')
            : await query;
        if (!property) return res.status(404).json({ message: 'Property not found.' });
        if (property.status !== 'published' && (!req.user || !canManage(property.owner, req.user))) {
            return res.status(404).json({ message: 'Property not found.' });
        }
        return res.status(200).json({ property });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        if (!property) return res.status(404).json({ message: 'Property not found.' });
        if (!canManage(property.owner, req.user)) {
            return res.status(403).json({ message: 'You cannot manage this property.' });
        }

        Object.assign(property, pickFields(req.body, [
            'name',
            'description',
            'location',
            'amenities',
            'imageUrls',
            'nightlyRateCents',
            'maxGuests',
            'currency',
            'status'
        ]));
        await property.save();
        return res.status(200).json({ property });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const archiveProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);
        if (!property) return res.status(404).json({ message: 'Property not found.' });
        if (!canManage(property.owner, req.user)) {
            return res.status(403).json({ message: 'You cannot manage this property.' });
        }

        property.status = 'archived';
        await property.save();
        return res.status(200).json({ property });
    } catch (error) {
        return respondWithError(res, error);
    }
};

module.exports = { createProperty, listProperties, listFeaturedProperties, listMyProperties, getProperty, updateProperty, archiveProperty };