const ImageKitModule = require('@imagekit/nodejs');
const ImageKit = ImageKitModule.ImageKit || ImageKitModule.default || ImageKitModule;
require('dotenv').config();

let client = null;

const getImageKitClient = () => {
    if (client) return client;

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.PUBLIC_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.URL_ENDPOINT || "https://ik.imagekit.io/sdmusic";

    if (!privateKey) {
        throw new Error('IMAGEKIT_PRIVATE_KEY or PRIVATE_KEY is not configured.');
    }

    client = new ImageKit({
        privateKey,
        publicKey,
        urlEndpoint,
        timeout: 300000
    });

    return client;
};

// Upload audio file to ImageKit (folder: sdmusic-tracks)
const uploadfile = async (file) => {
    try {
        if (!file || !file.buffer) {
            throw new Error("Invalid file upload input.");
        }

        console.log(`[Storage] Uploading audio "${file.originalname}"...`);
        const imagekit = getImageKitClient();
        const base64File = file.buffer.toString("base64");

        const result = await imagekit.files.upload({
            file: base64File,
            folder: "sdmusic-tracks",
            fileName: file.originalname || `track_${Date.now()}`
        });

        console.log(`[Storage] Audio upload successful: ${result.url}`);
        return result;
    } catch (error) {
        console.error("[Storage Error] Audio upload failed:", error.message);
        throw error;
    }
};

// Upload a hotel image to ImageKit.
const uploadImage = async (file) => {
    try {
        if (!file || !file.buffer) {
            throw new Error("Invalid image upload input.");
        }

        console.log(`[Storage] Uploading cover image "${file.originalname}"...`);
        const imagekit = getImageKitClient();
        const base64File = file.buffer.toString("base64");

        const result = await imagekit.files.upload({
            file: base64File,
            folder: "hotel-booking/properties",
            fileName: (file.originalname || `property_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_')
        });

        console.log(`[Storage] Image upload successful: ${result.url}`);
        return result;
    } catch (error) {
        console.error("[Storage Error] Image upload failed:", error.message);
        throw error;
    }
};

module.exports = { uploadfile, uploadImage };