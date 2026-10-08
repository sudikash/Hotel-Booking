const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/property.controller');
const { authUser, optionalAuth } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');

const router = express.Router();
const paginationRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];
const propertyRules = (partial = false) => {
    const field = (name, optional = false) => {
        const chain = body(name);
        return partial || optional ? chain.optional() : chain;
    };

    return [
        field('name').isString().trim().notEmpty().isLength({ max: 120 }),
        field('description', true).isString().isLength({ max: 5000 }),
        field('location').isObject(),
        field('location.city').isString().trim().notEmpty(),
        field('location.country').isString().trim().notEmpty(),
        field('location.address', true).isString().trim(),
        field('location.postalCode', true).isString().trim(),
        field('amenities', true).isArray(),
        field('amenities.*', true).isString().trim().notEmpty(),
        field('imageUrls', true).isArray(),
        field('imageUrls.*', true).isString().trim().notEmpty(),
        field('nightlyRateCents').isInt({ min: 1 }).toInt(),
        field('maxGuests').isInt({ min: 1 }).toInt(),
        field('currency', true).isISO4217(),
        field('status', true).isIn(['draft', 'published', 'archived'])
    ];
};

router.get('/featured', controller.listFeaturedProperties);
router.get(
    '/',
    paginationRules,
    query('city').optional().isString().trim(),
    query('search').optional().isString().trim(),
    query('guests').optional().isInt({ min: 1 }).toInt(),
    validateRequest,
    controller.listProperties
);
router.get('/mine', authUser, paginationRules, validateRequest, controller.listMyProperties);
router.post('/', authUser, propertyRules(), validateRequest, controller.createProperty);
router.get('/:propertyId', optionalAuth, param('propertyId').isMongoId(), validateRequest, controller.getProperty);
router.patch('/:propertyId', authUser, param('propertyId').isMongoId(), propertyRules(true), validateRequest, controller.updateProperty);
router.delete('/:propertyId', authUser, param('propertyId').isMongoId(), validateRequest, controller.archiveProperty);

module.exports = router;