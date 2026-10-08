const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/booking.controller');
const { authUser } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validate.middleware');

const router = express.Router();
const paginationRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];
const bookingRules = [
    body('propertyId').isMongoId(),
    body('checkIn').isISO8601(),
    body('checkOut').isISO8601().custom((checkOut, { req }) =>
        new Date(checkOut).getTime() > new Date(req.body.checkIn).getTime()
    ),
    body('guests').isInt({ min: 1 }).toInt()
];

router.post('/', authUser, bookingRules, validateRequest, controller.createBooking);
router.get('/', authUser, paginationRules, validateRequest, controller.listBookings);
router.get('/owner', authUser, paginationRules, validateRequest, controller.listOwnerBookings);
router.patch('/:bookingId/decision', authUser, param('bookingId').isMongoId(), body('decision').isIn(['accept', 'deny']), validateRequest, controller.decideBooking);
router.get('/:bookingId', authUser, param('bookingId').isMongoId(), validateRequest, controller.getBooking);
router.patch('/:bookingId/cancel', authUser, param('bookingId').isMongoId(), validateRequest, controller.cancelBooking);

module.exports = router;