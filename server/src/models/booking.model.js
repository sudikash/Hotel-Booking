const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'properties',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true,
        validate: {
            validator(value) {
                return !this.checkIn || value > this.checkIn;
            },
            message: 'Check-out must be after check-in.'
        }
    },
    guests: {
        type: Number,
        required: true,
        min: 1,
        validate: Number.isInteger
    },
    nightlyRateCents: {
        type: Number,
        required: true,
        min: 1,
        validate: Number.isInteger
    },
    totalAmountCents: {
        type: Number,
        required: true,
        min: 1,
        validate: Number.isInteger
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true,
        match: /^[A-Z]{3}$/
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'denied', 'cancelled', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true,
    collection: 'bookings'
});

bookingSchema.index({ property: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('bookings', bookingSchema);