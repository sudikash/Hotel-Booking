const express = require('express');
const multer = require('multer');
const controller = require('../controllers/upload.controller');
const { authUser } = require('../middlewares/auth.middleware');

const router = express.Router();
const parseImages = multer({
    storage: multer.memoryStorage(),
    limits: { files: 10, fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, callback) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new Error('Only JPEG, PNG, WebP, and AVIF images are allowed.'));
        }
        return callback(null, true);
    }
}).array('images', 10);

router.post('/images', authUser, (req, res, next) => {
    parseImages(req, res, (error) => {
        if (!error) return next();
        return res.status(400).json({ message: error.message || 'Image upload is invalid.' });
    });
}, controller.uploadPropertyImages);

module.exports = router;