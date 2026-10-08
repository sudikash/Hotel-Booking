const storageService = require('../services/storage.service');
const { respondWithError } = require('../utils/api.utils');

const uploadPropertyImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Select at least one image to upload.' });
        }

        const uploads = await Promise.all(req.files.map((file) => storageService.uploadImage(file)));
        return res.status(201).json({ imageUrls: uploads.map((upload) => upload.url) });
    } catch (error) {
        return respondWithError(res, error);
    }
};

module.exports = { uploadPropertyImages };