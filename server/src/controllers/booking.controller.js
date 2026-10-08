const Booking = require('../models/booking.model');
const Property = require('../models/property.model');
const { canManage, getPagination, respondWithError } = require('../utils/api.utils');

const createBooking = async (req, res) => {
    try {
        const { propertyId, checkIn, checkOut, guests } = req.body;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const nights = Math.ceil((end.getTime() - start.getTime()) / 86400000);
        if (!Number.isSafeInteger(nights) || nights < 1) {
            return res.status(400).json({ message: 'Check-out must be after check-in.' });
        }

        const property = await Property.findById(propertyId);
        if (!property || property.status !== 'published') {
            return res.status(404).json({ message: 'Property not found.' });
        }
        if (property.owner && property.owner.toString() === req.user.id.toString()) {
            return res.status(403).json({ message: 'You cannot book your own property.' });
        }
        if (guests > property.maxGuests) {
            return res.status(400).json({ message: 'Guest count exceeds the hotel limit.' });
        }

        const conflict = await Booking.findOne({
            property: property._id,
            status: { $in: ['confirmed', 'pending'] },
            checkIn: { $lt: end },
            checkOut: { $gt: start }
        });
        if (conflict) {
            const isSelf = conflict.user && conflict.user.toString() === req.user.id.toString();
            return res.status(409).json({
                message: isSelf
                    ? 'You have already booked this hotel for the selected dates.'
                    : 'This hotel is already booked or reserved for the selected dates.'
            });
        }

        const totalAmountCents = property.nightlyRateCents * nights;
        if (!Number.isSafeInteger(totalAmountCents)) {
            return res.status(400).json({ message: 'Booking total is outside the supported amount range.' });
        }

        const booking = await Booking.create({
            user: req.user.id,
            property: property._id,
            checkIn: start,
            checkOut: end,
            guests,
            nightlyRateCents: property.nightlyRateCents,
            totalAmountCents,
            currency: property.currency
        });
        return res.status(201).json({ booking });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const listBookings = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const filter = { user: req.user.id };
        const [items, total] = await Promise.all([
            Booking.find(filter)
                .populate('property', 'name location imageUrls')
                .sort({ createdAt: -1 }).skip(skip).limit(limit),
            Booking.countDocuments(filter)
        ]);
        return res.status(200).json({ items, page, limit, total });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const listOwnerBookings = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        let filter = {};
        if (req.user.role !== 'admin') {
            const properties = await Property.find({ owner: req.user.id }).select('_id');
            filter = { property: { $in: properties.map((property) => property._id) } };
        }
        const [items, total] = await Promise.all([
            Booking.find(filter)
                .populate('property', 'name location imageUrls')
                .populate('user', 'userName email')
                .sort({ createdAt: -1 }).skip(skip).limit(limit),
            Booking.countDocuments(filter)
        ]);
        return res.status(200).json({ items, page, limit, total });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        const isBooker = booking.user.toString() === req.user.id.toString();
        if (!isBooker) {
            const property = await Property.findById(booking.property);
            if (!property || !canManage(property.owner, req.user)) {
                return res.status(403).json({ message: 'You cannot access this booking.' });
            }
        }
        return res.status(200).json({ booking });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const decideBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        const property = await Property.findById(booking.property);
        if (!property) return res.status(404).json({ message: 'Property not found.' });
        if (!canManage(property.owner, req.user)) {
            return res.status(403).json({ message: 'You cannot decide this booking.' });
        }
        if (booking.status !== 'pending') {
            return res.status(409).json({ message: 'Only pending bookings can be decided.' });
        }

        if (req.body.decision === 'accept') {
            const conflict = await Booking.findOne({
                _id: { $ne: booking._id },
                property: property._id,
                status: 'confirmed',
                checkIn: { $lt: booking.checkOut },
                checkOut: { $gt: booking.checkIn }
            });
            if (conflict) return res.status(409).json({ message: 'Another booking is confirmed for these dates.' });
            booking.status = 'confirmed';
        } else {
            booking.status = 'denied';
        }

        await booking.save();
        return res.status(200).json({ booking });
    } catch (error) {
        return respondWithError(res, error);
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        const isBooker = booking.user.toString() === req.user.id.toString();
        if (!isBooker && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You cannot cancel this booking.' });
        }
        if (['completed', 'denied'].includes(booking.status)) {
            return res.status(409).json({ message: 'This booking cannot be cancelled.' });
        }
        if (booking.status !== 'cancelled') {
            booking.status = 'cancelled';
            await booking.save();
        }
        return res.status(200).json({ booking });
    } catch (error) {
        return respondWithError(res, error);
    }
};

module.exports = { createBooking, listBookings, listOwnerBookings, getBooking, decideBooking, cancelBooking };