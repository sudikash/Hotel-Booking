const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		required: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		default: ''
	},
	location: {
		address: { type: String, trim: true, default: '' },
		city: { type: String, required: true, trim: true },
		country: { type: String, required: true, trim: true },
		postalCode: { type: String, trim: true, default: '' }
	},
	amenities: {
		type: [String],
		default: []
	},
	imageUrls: {
		type: [String],
		default: []
	},
	nightlyRateCents: {
		type: Number,
		required: true,
		min: 1,
		validate: Number.isInteger
	},
	maxGuests: {
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
		enum: ['draft', 'published', 'archived'],
		default: 'draft'
	}
}, {
	timestamps: true,
	collection: 'properties'
});

propertySchema.index({ owner: 1, createdAt: -1 });
propertySchema.index({ status: 1, 'location.city': 1 });

module.exports = mongoose.model('properties', propertySchema);
